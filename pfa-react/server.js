const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────
// FAKE DATA
// ─────────────────────────────────────────

const fakeUser = {
  id: 1,
  username: "demo_user",
  email: "demo@marketdash.com",
  role: "user",
};

const fakeAdmin = {
  id: 2,
  username: "admin",
  email: "admin@marketdash.com",
  role: "admin",
};

const regimes = ["Bull Market", "Bear Market", "Sideways", "High Volatility"];

function randomRegime() {
  return regimes[Math.floor(Math.random() * regimes.length)];
}

function generatePriceHistory(days = 180) {
  const history = [];
  let price = 4200;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    price = +(price + (Math.random() - 0.48) * 60).toFixed(2);
    history.push({
      date: date.toISOString().split("T")[0],
      price,
      volume: Math.floor(Math.random() * 5000000 + 1000000),
    });
  }
  return history;
}

function generateRegimeHistory(days = 180) {
  const history = [];
  const now = new Date();
  let currentRegime = "Bull Market";
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    if (Math.random() < 0.05) currentRegime = randomRegime();
    history.push({
      date: date.toISOString().split("T")[0],
      regime: currentRegime,
      confidence: +(Math.random() * 0.3 + 0.7).toFixed(2),
    });
  }
  return history;
}

const markets = [
  { id: 1, ticker: "SPY",  name: "S&P 500 ETF",      region: "US",     price: 521.4,  change: +1.2  },
  { id: 2, ticker: "QQQ",  name: "Nasdaq 100 ETF",    region: "US",     price: 443.8,  change: -0.5  },
  { id: 3, ticker: "DAX",  name: "DAX 40",            region: "Europe", price: 18230,  change: +0.8  },
  { id: 4, ticker: "FTSE", name: "FTSE 100",          region: "Europe", price: 8410,   change: -0.3  },
  { id: 5, ticker: "N225", name: "Nikkei 225",        region: "Asia",   price: 38750,  change: +1.5  },
  { id: 6, ticker: "HSI",  name: "Hang Seng Index",   region: "Asia",   price: 17890,  change: -1.1  },
];

const users = [
  { id: 1, username: "demo_user",  email: "demo@marketdash.com",  role: "user",  createdAt: "2025-01-15" },
  { id: 2, username: "admin",      email: "admin@marketdash.com", role: "admin", createdAt: "2024-12-01" },
  { id: 3, username: "alice",      email: "alice@example.com",    role: "user",  createdAt: "2025-03-10" },
  { id: 4, username: "bob",        email: "bob@example.com",      role: "user",  createdAt: "2025-04-02" },
];

// ─────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    return res.json({ token: "fake-admin-token-xyz", user: fakeAdmin });
  }
  if (username && password) {
    return res.json({ token: "fake-user-token-abc", user: fakeUser });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
app.get("/api/auth/me", (req, res) => {
  res.json(fakeUser);
});

// ─────────────────────────────────────────
// DASHBOARD ROUTES
// ─────────────────────────────────────────

// GET /api/dashboard/stats
app.get("/api/dashboard/stats", (req, res) => {
  res.json({
    totalMarkets: 6,
    activeSignals: 14,
    currentRegime: "Bull Market",
    regimeConfidence: 0.87,
    lastUpdated: new Date().toISOString(),
    weeklyReturn: +2.34,
    monthlyReturn: +5.12,
    volatilityIndex: 18.4,
  });
});

// GET /api/dashboard/signals
app.get("/api/dashboard/signals", (req, res) => {
  res.json([
    { id: 1, ticker: "SPY",  signal: "BUY",  confidence: 0.89, regime: "Bull Market",     timestamp: new Date().toISOString() },
    { id: 2, ticker: "QQQ",  signal: "HOLD", confidence: 0.72, regime: "Sideways",        timestamp: new Date().toISOString() },
    { id: 3, ticker: "DAX",  signal: "BUY",  confidence: 0.81, regime: "Bull Market",     timestamp: new Date().toISOString() },
    { id: 4, ticker: "FTSE", signal: "SELL", confidence: 0.68, regime: "Bear Market",     timestamp: new Date().toISOString() },
    { id: 5, ticker: "N225", signal: "BUY",  confidence: 0.91, regime: "Bull Market",     timestamp: new Date().toISOString() },
    { id: 6, ticker: "HSI",  signal: "SELL", confidence: 0.75, regime: "High Volatility", timestamp: new Date().toISOString() },
  ]);
});

// ─────────────────────────────────────────
// REGIME ROUTES
// ─────────────────────────────────────────

// GET /api/current-regime
app.get("/api/current-regime", (req, res) => {
  res.json({
    regime: "Bull Market",
    confidence: 0.87,
    model: "HMM",
    nComponents: 4,
    interpretation: "Marché haussier avec forte tendance positive. Les indicateurs montrent une dynamique d'achat soutenue.",
    statistics: {
      returns:    +0.0234,
      volatility: 0.142,
      drawdown:   -0.031,
      sharpe:     1.87,
    },
    updatedAt: new Date().toISOString(),
  });
});

// GET /api/price-regimes  (history)
app.get("/api/price-regimes", (req, res) => {
  const { ticker = "SPY", model = "HMM" } = req.query;
  res.json({
    ticker,
    model,
    priceHistory:  generatePriceHistory(180),
    regimeHistory: generateRegimeHistory(180),
  });
});

// GET /api/model-stats
app.get("/api/model-stats", (req, res) => {
  res.json({
    HMM: {
      accuracy:    0.84,
      precision:   0.81,
      recall:      0.79,
      f1:          0.80,
      trainedAt:   "2026-04-20T10:00:00Z",
      nComponents: 4,
    },
    GARCH: {
      accuracy:    0.78,
      precision:   0.76,
      recall:      0.74,
      f1:          0.75,
      trainedAt:   "2026-04-20T10:00:00Z",
    },
    KMeans: {
      accuracy:    0.71,
      precision:   0.69,
      recall:      0.68,
      f1:          0.685,
      trainedAt:   "2026-04-20T10:00:00Z",
      nClusters:   4,
    },
  });
});

// ─────────────────────────────────────────
// MARKET ROUTES
// ─────────────────────────────────────────

// GET /api/markets
app.get("/api/markets", (req, res) => {
  const { region } = req.query;
  const result = region
    ? markets.filter((m) => m.region.toLowerCase() === region.toLowerCase())
    : markets;
  res.json(result);
});

// GET /api/markets/:ticker
app.get("/api/markets/:ticker", (req, res) => {
  const market = markets.find(
    (m) => m.ticker.toLowerCase() === req.params.ticker.toLowerCase()
  );
  if (!market) return res.status(404).json({ error: "Market not found" });
  res.json({
    ...market,
    priceHistory:  generatePriceHistory(90),
    regimeHistory: generateRegimeHistory(90),
  });
});

// ─────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────

// GET /api/admin/users
app.get("/api/admin/users", (req, res) => {
  res.json(users);
});

// POST /api/admin/users
app.post("/api/admin/users", (req, res) => {
  const newUser = { id: users.length + 1, ...req.body, createdAt: new Date().toISOString().split("T")[0] };
  users.push(newUser);
  res.status(201).json(newUser);
});

// DELETE /api/admin/users/:id
app.delete("/api/admin/users/:id", (req, res) => {
  const idx = users.findIndex((u) => u.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  users.splice(idx, 1);
  res.json({ message: "User deleted" });
});

// GET /api/admin/market-data
app.get("/api/admin/market-data", (req, res) => {
  res.json({
    totalRecords: 54720,
    lastLoaded:   new Date().toISOString(),
    sources:      ["Yahoo Finance", "Alpha Vantage", "FRED"],
    status:       "healthy",
  });
});

// POST /api/admin/market-data/load
app.post("/api/admin/market-data/load", (req, res) => {
  setTimeout(() => {
    res.json({ message: "Market data loaded successfully", records: 1440 });
  }, 1000);
});

// GET /api/admin/analyses
app.get("/api/admin/analyses", (req, res) => {
  res.json([
    { id: 1, ticker: "SPY",  model: "HMM",    status: "completed", runAt: "2026-04-26T00:00:00Z", duration: "2.3s" },
    { id: 2, ticker: "QQQ",  model: "GARCH",  status: "completed", runAt: "2026-04-25T23:00:00Z", duration: "1.8s" },
    { id: 3, ticker: "DAX",  model: "KMeans", status: "completed", runAt: "2026-04-25T22:00:00Z", duration: "0.9s" },
    { id: 4, ticker: "FTSE", model: "HMM",    status: "failed",    runAt: "2026-04-25T21:00:00Z", duration: "N/A"  },
  ]);
});

// ─────────────────────────────────────────
// REPORT ROUTES
// ─────────────────────────────────────────

// GET /api/reports
app.get("/api/reports", (req, res) => {
  res.json([
    { id: 1, title: "Rapport Mensuel - Avril 2026", format: "PDF", createdAt: "2026-04-01", author: "demo_user" },
    { id: 2, title: "Analyse HMM - SPY Q1",         format: "CSV", createdAt: "2026-03-31", author: "admin"     },
  ]);
});

// POST /api/reports/generate
app.post("/api/reports/generate", (req, res) => {
  const { format = "PDF", ticker = "SPY" } = req.body;
  setTimeout(() => {
    res.json({
      id:        Math.floor(Math.random() * 1000),
      title:     `Rapport ${ticker} - ${new Date().toLocaleDateString("fr-FR")}`,
      format,
      createdAt: new Date().toISOString(),
      downloadUrl: `/api/reports/download/fake-report.${format.toLowerCase()}`,
    });
  }, 800);
});

// ─────────────────────────────────────────
// USER PROFILE ROUTES
// ─────────────────────────────────────────

// GET /api/profile
app.get("/api/profile", (req, res) => {
  res.json(fakeUser);
});

// PUT /api/profile
app.put("/api/profile", (req, res) => {
  res.json({ ...fakeUser, ...req.body, updatedAt: new Date().toISOString() });
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n✅  Fake backend running at http://localhost:${PORT}`);
  console.log(`\n📋  Available routes:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/current-regime`);
  console.log(`   GET    /api/price-regimes?ticker=SPY&model=HMM`);
  console.log(`   GET    /api/model-stats`);
  console.log(`   GET    /api/dashboard/stats`);
  console.log(`   GET    /api/dashboard/signals`);
  console.log(`   GET    /api/markets`);
  console.log(`   GET    /api/markets/:ticker`);
  console.log(`   GET    /api/admin/users`);
  console.log(`   GET    /api/admin/analyses`);
  console.log(`   GET    /api/reports`);
  console.log(`   POST   /api/reports/generate`);
  console.log(`\n🔑  Login: username=admin password=admin (ou n'importe quoi d'autre)\n`);
});