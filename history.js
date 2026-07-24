<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/styles.css">
  <title>Trade History · Anchor</title>
</head>
<body>
  <div id="app">
    <header>
      <div class="logo">
        <img src="/assets/logo.png" alt="Anchor Trading" width="32" height="32">
        <span>Anchor</span>
      </div>
      <div class="status" id="botStatus">● Checking...</div>
    </header>

    <section class="card">
      <div class="card-label">Trade History</div>
      <div id="historyList">Loading...</div>
    </section>

    <nav>
      <a href="/">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        </svg>
        Dashboard
      </a>
      <a href="/history.html" class="active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        History
      </a>
    </nav>
  </div>
  <script src="/app.js"></script>
  <script>
    // Ensure history loads after app.js defines loadHistory
    window.addEventListener('load', () => {
      if (typeof loadHistory === 'function') loadHistory();
    });
  </script>
</body>
</html>
