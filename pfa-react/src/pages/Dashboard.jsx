// pages/Dashboard.jsx
import { useState } from "react";
import { useMarket } from "../pages/MarketContext";
import Overview    from "./Overview";
import Regimes     from "./Regimes";
import Backtesting from "./Backtesting";
import Reports     from "./Reports";

// ── shared CSS (dark-blue palette) ───────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* Blue palette */
    --b900: #050c1a;
    --b800: #0a1628;
    --b700: #0f2040;
    --b600: #163058;
    --b500: #1e4480;
    --b400: #2d6cbc;
    --b300: #5b9fd8;
    --b200: #93c4ee;

    /* Regime colors – blue-shifted */
    --bull:   #38bdf8;   /* sky blue   */
    --bear:   #f87171;   /* red        */
    --range:  #fb923c;   /* orange     */
    --stress: #c084fc;   /* purple     */

    --sidebar-w: 220px;
    --bg:      #060d1c;
    --surface: #0c1830;
    --surface2:#102040;
    --surface3:#162a50;
    --border:  rgba(56,189,248,0.08);
    --border2: rgba(56,189,248,0.15);
    --text1:   #e2edfa;
    --text2:   #7ea8cc;
    --text3:   #3d6080;
    --accent:  #38bdf8;
    --accent-glow: rgba(56,189,248,0.15);
    --font: 'Space Grotesk', system-ui, sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  body { background: var(--bg); }

  .dash {
    display: flex;
    height: 100vh;
    background: var(--bg);
    font-family: var(--font);
    font-size: 13px;
    color: var(--text1);
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--b900);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    border-right: 1px solid var(--border);
    position: relative;
  }
  .sidebar::after {
    content: '';
    position: absolute;
    top: 0; right: 0; bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, transparent, rgba(56,189,248,0.12) 30%, rgba(56,189,248,0.12) 70%, transparent);
    pointer-events: none;
  }

  .logo {
    padding: 20px 16px 18px;
    border-bottom: 1px solid var(--border);
  }
  .logo-mark { display: flex; align-items: center; gap: 9px; }
  .logo-icon {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, var(--b500), var(--b400));
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 12px rgba(56,189,248,0.2);
  }
  .logo-text { font-size: 14px; font-weight: 600; color: #fff; letter-spacing: -0.3px; }
  .logo-sub  { font-size: 9px; color: var(--text3); margin-top: 1px; letter-spacing: .1em; text-transform: uppercase; }

  /* Market display card in sidebar */
  .market-display {
    padding: 12px 10px;
    border-bottom: 1px solid var(--border);
  }
  .market-display-label {
    font-size: 9px; color: var(--text3); letter-spacing: .1em;
    text-transform: uppercase; margin-bottom: 8px; padding: 0 4px;
  }
  .market-card {
    border-radius: 9px;
    overflow: hidden;
    border: 1px solid rgba(56,189,248,0.15);
    background: var(--b800);
    position: relative;
  }
  .market-flag {
    width: 100%;
    height: 56px;
    object-fit: cover;
    display: block;
    transition: opacity 0.5s ease;
  }
  .market-flag-overlay {
    position: absolute;
    inset: 0;
    height: 56px;
    background: linear-gradient(to bottom, rgba(5,12,26,0.1), rgba(5,12,26,0.55));
  }
  .market-info {
    padding: 9px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .market-region-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .market-live-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--bull);
    flex-shrink: 0;
    animation: pulse 2s ease infinite;
  }
  .market-region-name {
    font-size: 9px;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: .1em;
  }
  .market-domain-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: -0.2px;
    transition: opacity 0.4s ease;
    font-family: var(--mono);
  }

  /* Nav */
  .nav { padding: 10px 8px; flex: 1; overflow-y: auto; }
  .nav-section { margin-bottom: 18px; }
  .nav-label {
    font-size: 9px; color: var(--text3); letter-spacing: .1em;
    text-transform: uppercase; padding: 0 8px; margin-bottom: 5px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: 6px;
    cursor: pointer; color: var(--text2);
    font-size: 12px; transition: all .15s;
    margin-bottom: 1px; border: none;
    background: transparent; width: 100%;
    text-align: left; font-family: var(--font);
  }
  .nav-item:hover { background: var(--surface2); color: var(--text1); }
  .nav-item.active {
    background: var(--b600);
    color: var(--accent);
    font-weight: 500;
  }
  .nav-item svg { width: 13px; height: 13px; flex-shrink: 0; }
  .nav-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .nav-dot.bull   { background: var(--bull);   }
  .nav-dot.bear   { background: var(--bear);   }
  .nav-dot.range  { background: var(--range);  }
  .nav-dot.stress { background: var(--stress); }

  .sidebar-footer {
    padding: 10px 8px;
    border-top: 1px solid var(--border);
  }
  .hmm-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 10px;
    background: rgba(56,189,248,0.06);
    border: 1px solid rgba(56,189,248,0.15);
    border-radius: 7px;
  }
  .hmm-icon {
    width: 22px; height: 22px;
    background: var(--b500);
    border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: var(--accent); font-weight: 600;
    font-family: var(--mono);
  }
  .hmm-text { flex: 1; }
  .hmm-name { font-size: 11px; font-weight: 500; color: var(--text1); }
  .hmm-sub  { font-size: 9px; color: var(--text3); margin-top: 1px; }
  .hmm-badge {
    font-size: 8px; padding: 2px 5px;
    background: rgba(56,189,248,0.1);
    color: var(--accent); border-radius: 3px;
    font-weight: 600; letter-spacing: .05em;
  }
  .status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--bull); flex-shrink: 0;
    animation: pulse 2s ease infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1; box-shadow: 0 0 0 0 rgba(56,189,248,0.4)} 50%{opacity:.6; box-shadow: 0 0 0 4px rgba(56,189,248,0)} }

  /* ── Main ── */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  .header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    height: 54px;
    display: flex; align-items: center; gap: 14px;
    flex-shrink: 0;
  }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .header-title { font-size: 14px; font-weight: 600; color: var(--text1); }
  .header-market {
    font-size: 11px; color: var(--accent);
    background: rgba(56,189,248,0.08);
    padding: 3px 8px; border-radius: 4px;
    border: 1px solid rgba(56,189,248,0.15);
    font-family: var(--mono);
  }
  .header-spacer { flex: 1; }
  .date-badge {
    font-size: 11px; color: var(--text3);
    background: var(--surface2);
    padding: 5px 10px; border-radius: 5px;
    border: 1px solid var(--border);
    font-family: var(--mono);
  }
  .alert-badge {
    position: relative; width: 30px; height: 30px;
    border-radius: 7px; background: rgba(245,158,11,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 1px solid rgba(245,158,11,0.15);
    flex-shrink: 0;
  }
  .alert-dot {
    position: absolute; top: 5px; right: 5px;
    width: 6px; height: 6px;
    background: #f59e0b; border-radius: 50%;
  }

  /* ── Page ── */
  .page-content {
    flex: 1; overflow-y: auto;
    padding: 20px 24px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .page-loader {
    flex: 1; display: flex; align-items: center;
    justify-content: center; font-size: 13px; color: var(--text3);
    gap: 8px;
  }
  .spinner-sm {
    width: 16px; height: 16px;
    border: 2px solid var(--border2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Skeleton ── */
  .skeleton {
    background: linear-gradient(90deg, var(--surface2) 25%, var(--surface3) 50%, var(--surface2) 75%);
    background-size: 400% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 6px;
  }
  @keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }

  /* ── KPIs ── */
  .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
  .kpi-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 16px;
    transition: border-color .2s;
  }
  .kpi-card:hover { border-color: var(--border2); }
  .kpi-card.regime-card {
    background: var(--b700);
    border-color: rgba(56,189,248,0.2);
  }
  .kpi-label {
    font-size: 10px; color: var(--text3);
    text-transform: uppercase; letter-spacing: .07em; margin-bottom: 6px;
  }
  .kpi-value { font-size: 20px; font-weight: 600; color: var(--text1); line-height: 1; font-family: var(--mono); }
  .kpi-card.regime-card .kpi-value { color: #fff; }
  .kpi-badge {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 10px; margin-top: 6px;
    padding: 2px 6px; border-radius: 3px;
    font-family: var(--mono);
  }
  .kpi-badge.positive { background: rgba(56,189,248,0.1); color: var(--accent); }
  .kpi-badge.negative { background: rgba(248,113,113,0.12); color: #dc2626; }
  .kpi-badge.neutral  { background: rgba(148,163,184,0.1); color: #64748b; }
  .kpi-sub { font-size: 10px; color: var(--text3); margin-top: 5px; }
  .conf-bar { height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 8px; overflow: hidden; }
  .conf-fill { height: 100%; border-radius: 2px; }

  /* ── Cards ── */
  .two-col { display: grid; grid-template-columns: 1fr 310px; gap: 16px; }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 18px 20px;
  }
  .card-header {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 14px;
  }
  .card-title { font-size: 13px; font-weight: 600; color: var(--text1); }
  .card-sub   { font-size: 11px; color: var(--text3); margin-top: 2px; }
  .chip {
    font-size: 10px; padding: 3px 8px; border-radius: 4px;
    background: rgba(56,189,248,0.08); color: var(--accent);
    font-weight: 500; border: 1px solid rgba(56,189,248,0.15);
  }

  /* ── Timeframe selector ── */
  .timeframe-bar {
    display: flex; gap: 2px;
    background: var(--surface2);
    border-radius: 6px; padding: 2px;
    border: 1px solid var(--border);
  }
  .tf-btn {
    padding: 4px 10px; border-radius: 4px;
    font-size: 10px; font-weight: 500;
    border: none; background: transparent;
    color: var(--text3); cursor: pointer;
    font-family: var(--mono); transition: all .15s;
  }
  .tf-btn.active {
    background: var(--b500);
    color: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.3);
  }

  /* ── Fullscreen modal ── */
  .chart-modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(5,12,26,0.92);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .chart-modal {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 14px;
    width: 100%; max-width: 1100px;
    padding: 24px;
    position: relative;
    box-shadow: 0 32px 80px rgba(0,0,0,.6);
    animation: slideUp .25s cubic-bezier(.16,1,.3,1);
  }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .modal-close {
    position: absolute; top: 14px; right: 14px;
    width: 28px; height: 28px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 6px; display: flex; align-items: center;
    justify-content: center; cursor: pointer; color: var(--text2);
    font-size: 14px; transition: all .15s;
  }
  .modal-close:hover { background: var(--surface3); color: var(--text1); }

  /* ── Legend ── */
  .regime-legend { display: flex; gap: 12px; flex-wrap: wrap; }
  .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text2); }
  .legend-dot  { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }

  /* ── Alerts ── */
  .alert-row {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .alert-row:last-child { border-bottom: none; }
  .alert-icon {
    width: 26px; height: 26px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 11px;
  }
  .alert-icon.warn   { background: rgba(245,158,11,0.12); }
  .alert-icon.info   { background: rgba(56,189,248,0.1); }
  .alert-icon.danger { background: rgba(248,113,113,0.1); }
  .alert-content { flex: 1; }
  .alert-title { font-size: 12px; font-weight: 500; color: var(--text1); margin-bottom: 2px; }
  .alert-desc  { font-size: 11px; color: var(--text3); line-height: 1.5; }
  .alert-time  { font-size: 10px; color: var(--text3); margin-top: 3px; font-family: var(--mono); }
  .active-indicator { width: 6px; height: 6px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
  .active-indicator.warn   { background: #f59e0b; }
  .active-indicator.info   { background: var(--accent); }
  .active-indicator.danger { background: #ef4444; }

  /* ── Table ── */
  .stats-table { width: 100%; border-collapse: collapse; }
  .stats-table th {
    font-size: 9px; color: var(--text3);
    text-transform: uppercase; letter-spacing: .07em;
    padding: 6px 10px; text-align: left;
    border-bottom: 1px solid var(--border); font-weight: 500;
  }
  .stats-table td {
    padding: 9px 10px; font-size: 12px; color: var(--text2);
    border-bottom: 1px solid var(--border);
    vertical-align: middle; font-family: var(--mono);
  }
  .stats-table tr:last-child td { border-bottom: none; }
  .stats-table td:first-child { font-family: var(--font); font-weight: 500; color: var(--text1); }

  /* ── Regime badges ── */
  .regime-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; padding: 3px 7px; border-radius: 4px; font-weight: 500;
  }
  .regime-badge.bull   { background: rgba(56,189,248,0.1);  color: var(--bull);   }
  .regime-badge.bear   { background: rgba(248,113,113,0.1); color: var(--bear);   }
  .regime-badge.range  { background: rgba(251,146,60,0.1);  color: var(--range);  }
  .regime-badge.stress { background: rgba(192,132,252,0.1); color: var(--stress); }

  /* ── Interp blocks ── */
  .interp-block {
    background: var(--surface2);
    border-radius: 8px; padding: 13px 15px;
    margin-bottom: 10px;
    border-left: 3px solid var(--b400);
  }
  .interp-title { font-size: 11px; font-weight: 600; color: var(--text1); margin-bottom: 4px; }
  .interp-text  { font-size: 11px; color: var(--text2); line-height: 1.6; }

  /* ── Model comparison ── */
  .model-score {
    display: flex; align-items: center;
    padding: 9px 0; border-bottom: 1px solid var(--border);
  }
  .model-score:last-child { border-bottom: none; }
  .model-name  { font-size: 12px; color: var(--text2); font-weight: 500; min-width: 70px; }
  .score-bar-wrap { flex: 1; margin: 0 12px; height: 4px; background: var(--surface2); border-radius: 2px; overflow: hidden; }
  .score-bar { height: 100%; border-radius: 2px; }
  .score-val { font-size: 12px; font-weight: 500; color: var(--text1); min-width: 36px; text-align: right; font-family: var(--mono); }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 3px; }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .kpi-grid { grid-template-columns: repeat(3, 1fr); }
    .two-col  { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    :root { --sidebar-w: 0px; }
    .sidebar { display: none; }
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

const MARKET_MAP = {
  NA:   [{ id: "SP500", label: "S&P 500" }, { id: "Nasdaq", label: "Nasdaq 100" }],
  EU:   [{ id: "EuroStoxx50", label: "Euro Stoxx 50" }, { id: "FTSE100", label: "FTSE 100" }],
  Asia: [{ id: "Nikkei225", label: "Nikkei 225" }, { id: "HangSeng", label: "Hang Seng" }],
};

const FLAG_URLS = {
  NA:   "https://flagcdn.com/w320/us.png",
  EU:   "https://flagcdn.com/w320/eu.png",
  Asia: "https://flagcdn.com/w320/jp.png",
};

const REGION_LABELS = {
  NA:   "United States",
  EU:   "European Union",
  Asia: "Asia Pacific",
};

const NAV_ITEMS = [
  {
    section: "Analytics",
    items: [
      { id: "overview",    label: "Overview",    icon: <svg viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor"/><rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".5"/><rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity=".5"/><rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity=".3"/></svg> },
      { id: "regimes",     label: "Regimes",     icon: <svg viewBox="0 0 14 14" fill="none"><polyline points="1,10 4,6 7,8 10,4 13,5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
      { id: "backtesting", label: "Backtesting", icon: <svg viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><polyline points="7,4 7,7 9,9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
      { id: "reports",     label: "Reports",     icon: <svg viewBox="0 0 14 14" fill="none"><rect x="1.5" y="4" width="11" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.3"/><polyline points="4.5,4 4.5,2 9.5,2 9.5,4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    ],
  },
  {
    section: "Regimes",
    items: [
      { id: "regimes", label: "Bull Market",   dot: "bull"   },
      { id: "regimes", label: "Bear Market",   dot: "bear"   },
      { id: "regimes", label: "Range / Trans.", dot: "range"  },
      { id: "regimes", label: "Stress Market", dot: "stress" },
    ],
  },
];

const PAGE_TITLES = {
  overview:    "Market Regime Dashboard",
  regimes:     "Regime Library",
  backtesting: "Backtesting",
  reports:     "Reports",
};

export default function Dashboard() {
  const [page, setPage] = useState("overview");
  const { region, market } = useMarket();

  const activeMarketLabel = MARKET_MAP[region]?.find(m => m.id === market)?.label || market;

  const PageComponent = { overview: Overview, regimes: Regimes, backtesting: Backtesting, reports: Reports }[page];

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">
              <div className="logo-icon">
                <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                  <polyline points="1,12 5,7 9,9 15,3" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="logo-text">RegimeAI</div>
                <div className="logo-sub">Market Intelligence</div>
              </div>
            </div>
          </div>

          {/* Market display */}
          <div className="market-display">
            <div className="market-display-label">Active Market</div>
            <div className="market-card">
              <img
                key={region}
                src={FLAG_URLS[region]}
                alt={region}
                className="market-flag"
              />
              <div className="market-flag-overlay" />
              <div className="market-info">
                <div className="market-region-row">
                  <div className="market-live-dot" />
                  <span className="market-region-name">{REGION_LABELS[region]}</span>
                </div>
                <div key={market} className="market-domain-name">
                  {activeMarketLabel}
                </div>
              </div>
            </div>
          </div>

          <nav className="nav">
            {NAV_ITEMS.map(section => (
              <div key={section.section} className="nav-section">
                <div className="nav-label">{section.section}</div>
                {section.items.map((item, i) => (
                  <button
                    key={`${item.id}-${i}`}
                    className={`nav-item${page === item.id && section.section === "Analytics" ? " active" : ""}`}
                    onClick={() => setPage(item.id)}
                  >
                    {item.dot ? <div className={`nav-dot ${item.dot}`} /> : item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="hmm-pill">
              <div className="hmm-icon">HM</div>
              <div className="hmm-text">
                <div className="hmm-name">HMM Model</div>
                <div className="hmm-sub">Highest accuracy</div>
              </div>
              <div className="hmm-badge">★ BEST</div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main">
          <header className="header">
            <div className="header-left">
              <span className="header-title">{PAGE_TITLES[page]}</span>
              <span className="header-market">{activeMarketLabel}</span>
            </div>
            <div className="header-spacer" />
            <div className="date-badge">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · 16:00 EST
            </div>
            <div className="alert-badge">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5C7 1.5 3 4 3 8.5H11C11 4 7 1.5 7 1.5Z" stroke="#f59e0b" strokeWidth="1.3" strokeLinejoin="round"/>
                <line x1="7" y1="8.5" x2="7" y2="11" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="7" cy="12.5" r=".8" fill="#f59e0b"/>
              </svg>
              <div className="alert-dot" />
            </div>
          </header>

          {PageComponent && <PageComponent />}
        </div>
      </div>
    </>
  );
}
