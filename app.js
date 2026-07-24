// ---------- CONFIGURATION (update once your VPS is ready) ----------
const API_URL = 'https://YOUR_VPS_IP_OR_DOMAIN:5000';
const API_KEY = 'YOUR_ANCHOR_API_KEY';

// ---------- GLOBAL STATE ----------
let pushSubscription = null;

// ---------- HELPER: API CALL ----------
async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${endpoint}`, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('API error:', e);
    return null;
  }
}

// ---------- UPDATE STATUS DOT & TEXT ----------
function setBotStatus(online, text) {
  const dot = document.querySelector('#botStatus .status-dot');
  const label = document.querySelector('#botStatus .status-text');
  if (dot) {
    dot.className = 'status-dot ' + (online ? 'online' : 'offline');
  }
  if (label) {
    label.textContent = text;
  }
}

// ---------- LOAD STATUS & UPDATE UI ----------
async function loadStatus() {
  const data = await apiCall('/status');
  if (!data) {
    setBotStatus(false, 'Offline');
    return;
  }

  setBotStatus(true, 'Online');

  // Equity
  document.getElementById('equityValue').textContent = `$${data.equity.toFixed(2)}`;
  const change = data.today_pnl || 0;
  const changePercent = data.today_pnl_pct || 0;
  const changeEl = document.getElementById('equityChange');
  const changeSign = change >= 0 ? '+' : '';
  changeEl.innerHTML = `<span class="change-value">Today ${changeSign}$${Math.abs(change).toFixed(2)}</span>
                         <span class="change-pct">(${changePercent.toFixed(2)}%)</span>`;
  changeEl.style.color = change >= 0 ? '#2ECC71' : '#E74C3C';

  // Open trade
  const tradeCard = document.getElementById('openTradeCard');
  if (data.open_trade) {
    tradeCard.style.display = 'block';
    document.getElementById('tradeInstrument').textContent = data.open_trade.instrument;
    const dirPill = document.getElementById('tradeDirection');
    dirPill.textContent = data.open_trade.direction;
    dirPill.className = 'trade-direction-pill';
    if (data.open_trade.direction === 'Short') dirPill.classList.add('short');
    document.getElementById('tradeEntry').textContent = data.open_trade.entry;
    document.getElementById('tradeSL').textContent = data.open_trade.sl;
    document.getElementById('tradeTP').textContent = data.open_trade.tp;
    const unrealized = data.open_trade.unrealized_pnl || 0;
    const unrealEl = document.getElementById('tradeUnrealized');
    unrealEl.textContent = `${unrealized >= 0 ? '+' : ''}$${Math.abs(unrealized).toFixed(2)}`;
    unrealEl.style.color = unrealized >= 0 ? '#2ECC71' : '#E74C3C';
  } else {
    tradeCard.style.display = 'none';
  }

  // KPIs
  document.getElementById('kpiWinRate').textContent = data.metrics?.win_rate
    ? `${(data.metrics.win_rate * 100).toFixed(1)}%`
    : '--';
  document.getElementById('kpiSharpe').textContent = data.metrics?.sharpe?.toFixed(2) || '--';
  document.getElementById('kpiPF').textContent = data.metrics?.profit_factor?.toFixed(2) || '--';

  // Recent trades
  const trades = data.recent_trades || [];
  const tradesHtml = trades.length
    ? trades.map(t => {
        const pnlClass = t.pnl >= 0 ? 'positive' : 'negative';
        const pnlSign = t.pnl >= 0 ? '+' : '';
        return `
          <div class="trade-row">
            <span>${t.time}</span>
            <span>${t.instrument} ${t.direction}</span>
            <span class="pnl-pill ${pnlClass}">${pnlSign}$${Math.abs(t.pnl).toFixed(2)}</span>
          </div>`;
      }).join('')
    : '<div class="trade-row placeholder">No trades yet.</div>';
  document.getElementById('recentTradesList').innerHTML = tradesHtml;

  // Emergency button
  const emergencyBtn = document.getElementById('emergencyBtn');
  if (data.emergency_required) {
    emergencyBtn.style.display = 'flex';
    emergencyBtn.disabled = false;
  } else {
    emergencyBtn.style.display = 'none';
  }
}

// ---------- HISTORY PAGE ----------
async function loadHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  const data = await apiCall('/trades?limit=50');
  if (!data || !data.trades || data.trades.length === 0) {
    list.innerHTML = '<div class="trade-row placeholder">No trade history.</div>';
    return;
  }
  list.innerHTML = data.trades.map(t => {
    const pnlClass = t.pnl >= 0 ? 'positive' : 'negative';
    const pnlSign = t.pnl >= 0 ? '+' : '';
    return `
      <div class="trade-row">
        <span>${t.timestamp}</span>
        <span>${t.instrument} ${t.direction}</span>
        <span>Entry ${t.entry} → Exit ${t.exit}</span>
        <span class="pnl-pill ${pnlClass}">${pnlSign}$${Math.abs(t.pnl).toFixed(2)}</span>
      </div>`;
  }).join('');
}

// ---------- PUSH NOTIFICATIONS ----------
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

async function subscribeToPush() {
  try {
    const vapidResp = await fetch(`${API_URL}/vapid-public-key`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!vapidResp.ok) throw new Error('Failed to fetch VAPID key');
    const { publicKey } = await vapidResp.json();

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await fetch(`${API_URL}/subscribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    pushSubscription = subscription;
    document.getElementById('notifBtn').style.display = 'none';
    alert('Notifications enabled!');
  } catch (err) {
    console.error('Push subscription failed:', err);
    alert('Could not enable notifications. Check permissions and VAPID key.');
  }
}

async function checkNotificationStatus() {
  if (!('serviceWorker' in navigator && 'PushManager' in window)) {
    document.getElementById('notifBtn').style.display = 'flex';
    return;
  }
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) {
    document.getElementById('notifBtn').style.display = 'flex';
    return;
  }
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    pushSubscription = sub;
    document.getElementById('notifBtn').style.display = 'none';
  } else {
    document.getElementById('notifBtn').style.display = 'flex';
  }
}

// ---------- EMERGENCY OPTIMIZE ----------
async function triggerEmergencyOptimization() {
  if (!confirm('Start emergency optimization? Trading will halt temporarily.')) return;
  const btn = document.getElementById('emergencyBtn');
  btn.disabled = true;
  const res = await apiCall('/emergency-optimize', 'POST');
  if (res && res.success) {
    alert('Emergency optimization started. Check back soon.');
  } else {
    alert('Failed to start optimization. It may already be running or the server is down.');
    btn.disabled = false;
  }
}

// ---------- INIT ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    await navigator.serviceWorker.register('./sw.js');
    console.log('Service worker registered');
    checkNotificationStatus();
    loadStatus();
    setInterval(loadStatus, 30000);
  });
}

document.getElementById('notifBtn')?.addEventListener('click', subscribeToPush);
document.getElementById('emergencyBtn')?.addEventListener('click', triggerEmergencyOptimization);
