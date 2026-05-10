const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// ── HELPERS ────────────────────────────────────────────────────────────────────

function generatePricePoints(timeframe = "year") {
  const counts = { day: 78, week: 5, month: 22, year: 252, "10year": 520 };
  const n = counts[timeframe] || 252;
  const points = [];
  let price = 5250;
  const regimes = ["Bull", "Bear", "Range", "Stress"];
  let currentRegime = "Bull";
  const now = new Date();

  for (let i = n; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    if (Math.random() < 0.04) currentRegime = regimes[Math.floor(Math.random() * regimes.length)];
    const drift = currentRegime === "Bull" ? 0.53 : currentRegime === "Bear" ? 0.44 : 0.5;
    const vol   = currentRegime === "Stress" ? 120 : currentRegime === "Bear" ? 80 : 40;
    price = +(price + (Math.random() - drift) * vol).toFixed(2);
    if (price < 1000) price = 1000;
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    points.push({ date: label, price, regime: currentRegime });
  }
  return points;
}

function regimeDistribution(points) {
  const counts = { Bull: 0, Bear: 0, Range: 0, Stress: 0 };
  points.forEach(p => { if (counts[p.regime] !== undefined) counts[p.regime]++; });
  const total = points.length || 1;
  return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, +(v / total).toFixed(2)]));
}

// ── MAIN DASHBOARD ROUTE ───────────────────────────────────────────────────────

app.get("/api/dashboard", (req, res) => {
  const { timeframe = "year" } = req.query;
  const price_points = generatePricePoints(timeframe);
  const dist = regimeDistribution(price_points);
  const currentPrice = price_points[price_points.length - 1]?.price || 5250;
  const prevPrice    = price_points[price_points.length - 2]?.price || currentPrice;
  const dayChange    = (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2);

  res.json({
    current_regime: { type: "Bull", label: "Bull Market", confidence: 0.87 },
    metrics: {
      current_price: currentPrice,
      day_change:    `${dayChange >= 0 ? "+" : ""}${dayChange}%`,
      avg_return:    "+18.4%",
      annual_vol:    "11.2%",
      max_drawdown:  "-33.9%",
    },
    price_points,
    regime_distribution: dist,
  });
});

// ── AUTH ───────────────────────────────────────────────────────────────────────

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(401).json({ error: "Invalid credentials" });
  const isAdmin = username === "admin" && password === "admin";
  res.json({ token: isAdmin ? "fake-admin-token" : "fake-user-token", user: { id: isAdmin ? 2 : 1, username, email: `${username}@market.com`, role: isAdmin ? "admin" : "user" } });
});

app.post("/api/auth/logout", (req, res) => res.json({ message: "Logged out" }));
app.get("/api/auth/me",      (req, res) => res.json({ id: 1, username: "demo_user", email: "demo@market.com", role: "user" }));

// ── REGIME ─────────────────────────────────────────────────────────────────────

app.get("/api/current-regime", (req, res) => res.json({
  regime: "Bull Market", confidence: 0.87, model: req.query.model || "hmm",
  nComponents: 4, interpretation: "Marché haussier avec forte tendance positive.",
  statistics: { returns: 0.0234, volatility: 0.142, drawdown: -0.031, sharpe: 1.87 },
  updatedAt: new Date().toISOString(),
}));

app.get("/api/price-regimes", (req, res) => {
  const points = generatePricePoints(req.query.timeframe || "year");
  res.json({ ticker: req.query.ticker || "SPY", model: req.query.model || "hmm", priceHistory: points, regimeHistory: points });
});

app.get("/api/statistics", (req, res) => res.json({
  model: req.query.model || "hmm", period: "180 days",
  returns:    { mean: 0.0234, std: 0.0412, min: -0.089, max: 0.112 },
  volatility: { mean: 0.142,  std: 0.031,  min: 0.089,  max: 0.231 },
  drawdown:   { mean: -0.031, max: -0.087 }, sharpe: 1.87,
  regimeBreakdown: {
    Bull:   { count: 89, percentage: 49, avgReturn: 0.045  },
    Bear:   { count: 34, percentage: 19, avgReturn: -0.032 },
    Range:  { count: 41, percentage: 23, avgReturn: 0.004  },
    Stress: { count: 16, percentage: 9,  avgReturn: -0.018 },
  },
}));

app.get("/api/model-comparison", (req, res) => res.json([
  { model: "HMM",    accuracy: 0.84, precision: 0.81, recall: 0.79, f1: 0.80  },
  { model: "GARCH",  accuracy: 0.78, precision: 0.76, recall: 0.74, f1: 0.75  },
  { model: "KMeans", accuracy: 0.71, precision: 0.69, recall: 0.68, f1: 0.685 },
]));

app.get("/api/model-stats", (req, res) => res.json({
  HMM:    { accuracy: 0.84, precision: 0.81, recall: 0.79, f1: 0.80  },
  GARCH:  { accuracy: 0.78, precision: 0.76, recall: 0.74, f1: 0.75  },
  KMeans: { accuracy: 0.71, precision: 0.69, recall: 0.68, f1: 0.685 },
}));

// ── MARKETS ────────────────────────────────────────────────────────────────────

const marketList = [
  { id: 1, ticker: "SPY",  name: "S&P 500 ETF",    region: "US",     price: 521.4,  change: +1.2 },
  { id: 2, ticker: "QQQ",  name: "Nasdaq 100 ETF",  region: "US",     price: 443.8,  change: -0.5 },
  { id: 3, ticker: "DAX",  name: "DAX 40",          region: "Europe", price: 18230,  change: +0.8 },
  { id: 4, ticker: "FTSE", name: "FTSE 100",        region: "Europe", price: 8410,   change: -0.3 },
  { id: 5, ticker: "N225", name: "Nikkei 225",      region: "Asia",   price: 38750,  change: +1.5 },
  { id: 6, ticker: "HSI",  name: "Hang Seng Index", region: "Asia",   price: 17890,  change: -1.1 },
];

app.get("/api/markets", (req, res) => {
  const result = req.query.region ? marketList.filter(m => m.region.toLowerCase() === req.query.region.toLowerCase()) : marketList;
  res.json(result);
});
app.get("/api/markets/:ticker", (req, res) => {
  const m = marketList.find(m => m.ticker.toLowerCase() === req.params.ticker.toLowerCase());
  if (!m) return res.status(404).json({ error: "Not found" });
  res.json({ ...m, priceHistory: generatePricePoints("year") });
});

// ── DASHBOARD STATS / SIGNALS ──────────────────────────────────────────────────

app.get("/api/dashboard/stats", (req, res) => res.json({
  totalMarkets: 6, activeSignals: 14, currentRegime: "Bull Market",
  regimeConfidence: 0.87, weeklyReturn: 2.34, monthlyReturn: 5.12,
  volatilityIndex: 18.4, lastUpdated: new Date().toISOString(),
}));

app.get("/api/dashboard/signals", (req, res) => res.json([
  { id: 1, ticker: "SPY",  signal: "BUY",  confidence: 0.89, regime: "Bull Market",     timestamp: new Date().toISOString() },
  { id: 2, ticker: "QQQ",  signal: "HOLD", confidence: 0.72, regime: "Sideways",        timestamp: new Date().toISOString() },
  { id: 3, ticker: "DAX",  signal: "BUY",  confidence: 0.81, regime: "Bull Market",     timestamp: new Date().toISOString() },
  { id: 4, ticker: "FTSE", signal: "SELL", confidence: 0.68, regime: "Bear Market",     timestamp: new Date().toISOString() },
  { id: 5, ticker: "N225", signal: "BUY",  confidence: 0.91, regime: "Bull Market",     timestamp: new Date().toISOString() },
  { id: 6, ticker: "HSI",  signal: "SELL", confidence: 0.75, regime: "High Volatility", timestamp: new Date().toISOString() },
]));

// ── ADMIN ──────────────────────────────────────────────────────────────────────

const users = [
  { id: 1, username: "demo_user", email: "demo@market.com",  role: "user",  createdAt: "2025-01-15" },
  { id: 2, username: "admin",     email: "admin@market.com", role: "admin", createdAt: "2024-12-01" },
  { id: 3, username: "alice",     email: "alice@ex.com",     role: "user",  createdAt: "2025-03-10" },
];

app.get("/api/admin/users",   (req, res) => res.json(users));
app.post("/api/admin/users",  (req, res) => { const u = { id: users.length + 1, ...req.body, createdAt: new Date().toISOString().split("T")[0] }; users.push(u); res.status(201).json(u); });
app.delete("/api/admin/users/:id", (req, res) => { const i = users.findIndex(u => u.id === +req.params.id); if (i === -1) return res.status(404).json({ error: "Not found" }); users.splice(i, 1); res.json({ message: "Deleted" }); });
app.get("/api/admin/market-data", (req, res) => res.json({ totalRecords: 54720, lastLoaded: new Date().toISOString(), sources: ["Yahoo Finance"], status: "healthy" }));
app.post("/api/admin/market-data/load", (req, res) => setTimeout(() => res.json({ message: "Loaded", records: 1440 }), 1000));
app.get("/api/admin/analyses", (req, res) => res.json([
  { id: 1, ticker: "SPY", model: "HMM",   status: "completed", runAt: "2026-04-26T00:00:00Z", duration: "2.3s" },
  { id: 2, ticker: "QQQ", model: "GARCH", status: "completed", runAt: "2026-04-25T23:00:00Z", duration: "1.8s" },
]));

// ── REPORTS ────────────────────────────────────────────────────────────────────

app.get("/api/reports", (req, res) => res.json([
  { id: 1, title: "Rapport Mensuel - Avril 2026", format: "PDF", createdAt: "2026-04-01" },
  { id: 2, title: "Analyse HMM - SPY Q1",         format: "CSV", createdAt: "2026-03-31" },
]));
app.post("/api/reports/generate", (req, res) => {
  const { format = "PDF", ticker = "SPY" } = req.body;
  setTimeout(() => res.json({ id: Math.floor(Math.random() * 1000), title: `Rapport ${ticker}`, format, createdAt: new Date().toISOString() }), 800);
});

// ── PROFILE ────────────────────────────────────────────────────────────────────

app.get("/api/profile", (req, res) => res.json({ id: 1, username: "demo_user", email: "demo@market.com", role: "user" }));
app.put("/api/profile", (req, res) => res.json({ id: 1, ...req.body, updatedAt: new Date().toISOString() }));

// ── START ──────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n✅  Fake backend at http://localhost:${PORT}`);
  console.log(`   GET  /api/dashboard?market=SP500&timeframe=year  ← main route`);
  console.log(`   GET  /api/current-regime`);
  console.log(`   GET  /api/statistics`);
  console.log(`   GET  /api/model-comparison\n`);
});
