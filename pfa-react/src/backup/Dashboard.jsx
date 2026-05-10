// pages/Dashboard.jsx
import { useState, useEffect } from "react";
import Overview    from "./Overview";
import Regimes     from "./Regimes";
import Backtesting from "./Backtesting";
import Reports     from "./Reports";

const API = "http://localhost:5001/api";

function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData).catch(() => {});
  }, [url]);
  return data;
}

// ── shared CSS for all sub-pages ──────────────────────────────────────────────
const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --g900:#0a1a0f; --g800:#14301c; --g700:#1e4828; --g600:#276035;
    --g500:#3b8a50; --g400:#5cb374; --g300:#8ed4a2;
    --sidebar-w: 210px;
    --bg:#0d1610; --surface:#141f17; --surface2:#1a2b1e;
    --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.13);
    --text1:#e2ede6; --text2:#8aab92; --text3:#4f7358;
  }

  body { background: var(--bg); }

  .dash { display:flex; height:100vh; background:var(--bg); font-family:var(--font-sans,system-ui,sans-serif); font-size:13px; color:var(--text1); overflow:hidden; }

  /* ── Sidebar ── */
  .sidebar { width:var(--sidebar-w); background:var(--g900); display:flex; flex-direction:column; flex-shrink:0; border-right:1px solid rgba(255,255,255,0.05); }
  .logo { padding:20px 16px 16px; border-bottom:1px solid rgba(255,255,255,0.07); }
  .logo-mark { display:flex; align-items:center; gap:8px; }
  .logo-icon { width:28px; height:28px; background:var(--g500); border-radius:6px; display:flex; align-items:center; justify-content:center; }
  .logo-text { font-size:13px; font-weight:500; color:#fff; letter-spacing:.02em; }
  .logo-sub  { font-size:10px; color:rgba(255,255,255,0.35); margin-top:2px; letter-spacing:.05em; text-transform:uppercase; }
  .nav { padding:12px 8px; flex:1; overflow-y:auto; }
  .nav-section { margin-bottom:20px; }
  .nav-label { font-size:9px; color:rgba(255,255,255,0.3); letter-spacing:.1em; text-transform:uppercase; padding:0 8px; margin-bottom:6px; }
  .nav-item { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:6px; cursor:pointer; color:rgba(255,255,255,0.5); font-size:12px; transition:all .15s; margin-bottom:2px; border:none; background:transparent; width:100%; text-align:left; font-family:inherit; }
  .nav-item:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.85); }
  .nav-item.active { background:var(--g700); color:#fff; }
  .nav-item svg { width:14px; height:14px; flex-shrink:0; }
  .nav-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .nav-dot.bull { background:#4ade80; }
  .nav-dot.bear { background:#f87171; }
  .nav-dot.range { background:#fb923c; }
  .nav-dot.stress { background:#c084fc; }
  .sidebar-footer { padding:12px 8px; border-top:1px solid rgba(255,255,255,0.07); }
  .status-pill { display:flex; align-items:center; gap:6px; padding:7px 10px; background:rgba(255,255,255,0.05); border-radius:6px; }
  .status-dot { width:7px; height:7px; border-radius:50%; background:#4ade80; flex-shrink:0; animation: statusPulse 2s ease infinite; }
  @keyframes statusPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .status-text { font-size:11px; color:rgba(255,255,255,0.5); }
  .status-val  { font-size:11px; color:rgba(255,255,255,0.8); font-weight:500; margin-left:auto; }

  /* ── Main ── */
  .main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .header { background:var(--surface); border-bottom:1px solid var(--border); padding:0 24px; height:56px; display:flex; align-items:center; gap:16px; flex-shrink:0; }
  .header-title { font-size:15px; font-weight:500; color:var(--text1); }
  .header-sub   { font-size:12px; color:var(--text3); margin-left:4px; }
  .header-spacer { flex:1; }
  .model-select { display:flex; gap:2px; background:var(--surface2); border-radius:6px; padding:3px; border:1px solid var(--border); }
  .model-btn { padding:4px 10px; border-radius:4px; font-size:11px; cursor:pointer; color:var(--text2); border:none; background:transparent; font-family:inherit; transition:all .15s; }
  .model-btn.active { background:var(--surface); color:var(--text1); font-weight:500; box-shadow:0 1px 3px rgba(0,0,0,.2); }
  .date-badge { font-size:11px; color:var(--text3); background:var(--surface2); padding:5px 10px; border-radius:5px; border:1px solid var(--border); }
  .alert-badge { position:relative; width:28px; height:28px; border-radius:6px; background:rgba(245,158,11,0.1); display:flex; align-items:center; justify-content:center; cursor:pointer; border:1px solid var(--border); }
  .alert-dot { position:absolute; top:5px; right:5px; width:7px; height:7px; background:#f59e0b; border-radius:50%; }
  .page-content { flex:1; overflow-y:auto; padding:20px 24px; display:flex; flex-direction:column; gap:16px; }
  .page-loader  { flex:1; display:flex; align-items:center; justify-content:center; font-size:13px; color:var(--text3); }

  /* ── KPIs ── */
  .kpi-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; }
  .kpi-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:14px 16px; }
  .kpi-card.regime-card { background:var(--g800); border-color:var(--g700); }
  .kpi-label { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; }
  .kpi-card.regime-card .kpi-label { color:rgba(255,255,255,0.4); }
  .kpi-value { font-size:20px; font-weight:500; color:var(--text1); line-height:1; }
  .kpi-card.regime-card .kpi-value { color:#fff; }
  .kpi-badge { display:inline-flex; align-items:center; gap:4px; font-size:10px; margin-top:6px; padding:3px 7px; border-radius:4px; }
  .kpi-badge.positive { background:rgba(74,222,128,0.12); color:#16a34a; }
  .kpi-badge.negative { background:rgba(248,113,113,0.12); color:#dc2626; }
  .kpi-badge.neutral  { background:rgba(148,163,184,0.12); color:#64748b; }
  .kpi-sub { font-size:11px; color:var(--text3); margin-top:5px; }
  .conf-bar  { height:3px; background:rgba(255,255,255,0.12); border-radius:2px; margin-top:8px; overflow:hidden; }
  .conf-fill { height:100%; background:#4ade80; border-radius:2px; }

  /* ── Cards ── */
  .two-col { display:grid; grid-template-columns:1fr 320px; gap:16px; }
  .card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:18px 20px; }
  .card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .card-title  { font-size:13px; font-weight:500; color:var(--text1); }
  .card-sub    { font-size:11px; color:var(--text3); margin-top:2px; }
  .chip { font-size:10px; padding:3px 8px; border-radius:4px; background:rgba(59,138,80,0.1); color:var(--g400); font-weight:500; border:1px solid rgba(59,138,80,0.18); }

  /* ── Legend ── */
  .regime-legend { display:flex; gap:14px; flex-wrap:wrap; }
  .legend-item   { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--text2); }
  .legend-dot    { width:8px; height:8px; border-radius:2px; flex-shrink:0; }

  /* ── Model comparison ── */
  .model-score { display:flex; align-items:center; justify-content:space-between; padding:9px 0; border-bottom:1px solid var(--border); }
  .model-score:last-child { border-bottom:none; }
  .model-name  { font-size:12px; color:var(--text2); font-weight:500; }
  .score-bar-wrap { flex:1; margin:0 12px; height:4px; background:var(--surface2); border-radius:2px; overflow:hidden; }
  .score-bar { height:100%; border-radius:2px; }
  .score-val { font-size:12px; font-weight:500; color:var(--text1); min-width:36px; text-align:right; }

  /* ── Alerts ── */
  .alert-row { display:flex; align-items:flex-start; gap:10px; padding:10px 0; border-bottom:1px solid var(--border); }
  .alert-row:last-child { border-bottom:none; }
  .alert-icon { width:26px; height:26px; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:12px; }
  .alert-icon.warn   { background:rgba(245,158,11,0.12); }
  .alert-icon.info   { background:rgba(59,138,80,0.1);   }
  .alert-icon.danger { background:rgba(239,68,68,0.1);   }
  .alert-content { flex:1; }
  .alert-title { font-size:12px; font-weight:500; color:var(--text1); margin-bottom:2px; }
  .alert-desc  { font-size:11px; color:var(--text3); line-height:1.5; }
  .alert-time  { font-size:10px; color:var(--text3); margin-top:3px; }
  .active-indicator { width:6px; height:6px; border-radius:50%; margin-top:5px; flex-shrink:0; }
  .active-indicator.warn   { background:#f59e0b; }
  .active-indicator.info   { background:#4ade80; }
  .active-indicator.danger { background:#ef4444; }

  /* ── Table ── */
  .stats-table { width:100%; border-collapse:collapse; }
  .stats-table th { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:.05em; padding:6px 10px; text-align:left; border-bottom:1px solid var(--border); font-weight:500; }
  .stats-table td { padding:9px 10px; font-size:12px; color:var(--text2); border-bottom:1px solid var(--border); vertical-align:middle; }
  .stats-table tr:last-child td { border-bottom:none; }
  .stats-table td:first-child { font-weight:500; color:var(--text1); }

  /* ── Regime badges ── */
  .regime-badge { display:inline-flex; align-items:center; gap:4px; font-size:10px; padding:3px 7px; border-radius:4px; font-weight:500; }
  .regime-badge.bull   { background:rgba(74,222,128,0.1);  color:#15803d; }
  .regime-badge.bear   { background:rgba(248,113,113,0.1); color:#b91c1c; }
  .regime-badge.range  { background:rgba(251,146,60,0.1);  color:#c2410c; }
  .regime-badge.stress { background:rgba(192,132,252,0.1); color:#7c3aed; }

  /* ── Interpretation blocks ── */
  .interp-block { background:var(--surface2); border-radius:8px; padding:14px 16px; margin-bottom:10px; border-left:3px solid var(--g500); }
  .interp-title { font-size:11px; font-weight:500; color:var(--text1); margin-bottom:5px; }
  .interp-text  { font-size:12px; color:var(--text2); line-height:1.6; }
`;

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
      { id: "regimes", label: "Bull Market",  dot: "bull"   },
      { id: "regimes", label: "Bear Market",  dot: "bear"   },
      { id: "regimes", label: "Range / Trans.", dot: "range" },
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
  const [page,      setPage]      = useState("overview");
  const [activeModel, setActiveModel] = useState("HMM");
  const models = useFetch(`${API}/models`);

  useEffect(() => {
    if (models?.best_model) setActiveModel(models.best_model);
  }, [models]);

  const PageComponent = {
    overview:    Overview,
    regimes:     Regimes,
    backtesting: Backtesting,
    reports:     Reports,
  }[page];

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">
              <div className="logo-icon">
                <svg viewBox="0 0 16 16" fill="none">
                  <polyline points="1,12 5,7 9,9 15,3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="15" cy="3" r="1.5" fill="#4ade80"/>
                </svg>
              </div>
              <div>
                <div className="logo-text">RegimeAI</div>
                <div className="logo-sub">Market Intelligence</div>
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
                    {item.dot
                      ? <div className={`nav-dot ${item.dot}`} />
                      : item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="status-pill">
              <div className="status-dot" />
              <span className="status-text">Live</span>
              <span className="status-val">{activeModel}</span>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main">
          <header className="header">
            <div>
              <span className="header-title">{PAGE_TITLES[page]}</span>
              <span className="header-sub">S&amp;P 500</span>
            </div>
            <div className="header-spacer" />

            {/* Model switcher */}
            <div className="model-select">
              {["K-Means", "GMM", "HMM"].map(m => (
                <button
                  key={m}
                  className={`model-btn${activeModel === m ? " active" : ""}`}
                  onClick={() => setActiveModel(m)}
                >
                  {m}{models?.best_model === m ? " ★" : ""}
                </button>
              ))}
            </div>

            <div className="date-badge">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · 16:00 EST
            </div>
            <div className="alert-badge">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5C7 1.5 3 4 3 8.5H11C11 4 7 1.5 7 1.5Z" stroke="#f59e0b" strokeWidth="1.3" strokeLinejoin="round"/>
                <line x1="7" y1="8.5" x2="7" y2="11" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="7" cy="12.5" r="0.8" fill="#f59e0b"/>
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
