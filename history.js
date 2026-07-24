<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./styles.css">
  <title>Trade History · Anchor</title>
</head>
<body>
  <div id="app">
    <header>
      <div class="header-left">
        <img src="./assets/logo.png" alt="Anchor" class="logo-icon" width="36" height="36">
        <span class="logo-text">Anchor</span>
      </div>
      <div class="status-pill" id="botStatus">
        <span class="status-dot offline"></span>
        <span class="status-text">Checking...</span>
      </div>
    </header>

    <main>
      <div class="card">
        <div class="card-label">Trade History</div>
        <div id="historyList">
          <div class="trade-row placeholder">Loading...</div>
        </div>
      </div>
    </main>

    <nav>
      <a href="./" class="nav-item">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        </svg>
        <span class="nav-label">Dashboard</span>
      </a>
      <a href="./history.html" class="nav-item active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="nav-label">History</span>
      </a>
    </nav>
  </div>
  <script src="./app.js"></script>
  <script>
    window.addEventListener('load', () => {
      if (typeof loadHistory === 'function') loadHistory();
    });
  </script>
</body>
</html>
