import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5001/api";

// ── Design tokens ─────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #07080d;
    --surface:  #0d0f1a;
    --card:     #111422;
    --border:   #1c2035;
    --accent:   #534AB7;
    --accent2:  #1D9E75;
    --accent3:  #D85A30;
    --text:     #e2e4f0;
    --muted:    #4a4f6a;
    --font:     'Space Grotesk', sans-serif;
    --mono:     'JetBrains Mono', monospace;
    --bull-bg:  #0f1f0a; --bull-fg: #4caf28; --bull-bd: #1e3d10;
    --bear-bg:  #1f0a0a; --bear-fg: #e05555; --bear-bd: #3d1010;
    --stress-bg:#1f1408; --stress-fg:#e09a30; --stress-bd:#3d2a08;
    --range-bg: #0a1220; --range-fg: #4a9ce0; --range-bd: #0e2540;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; }

  /* ── Layout ── */
  .app { display: flex; flex-direction: column; min-height: 100vh; }
  .topnav {
    display: flex; align-items: center; gap: 0;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    position: sticky; top: 0; z-index: 100;
  }
  .brand {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 0; margin-right: 32px;
    font-size: 15px; font-weight: 700; letter-spacing: -0.3px; color: var(--text);
  }
  .brand-icon {
    width: 30px; height: 30px; background: var(--accent);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700;
  }
  .nav-tabs { display: flex; gap: 0; }
  .nav-tab {
    padding: 18px 16px; font-size: 13px; font-weight: 500;
    color: var(--muted); cursor: pointer; border: none; background: none;
    border-bottom: 2px solid transparent; transition: all .15s; white-space: nowrap;
  }
  .nav-tab:hover { color: var(--text); }
  .nav-tab.active { color: var(--text); border-bottom-color: var(--accent); }
  .nav-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .best-model-badge {
    display: flex; align-items: center; gap: 6px;
    background: rgba(83,74,183,0.12); border: 1px solid rgba(83,74,183,0.25);
    border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 500; color: #a09af0;
  }
  .dot-live { width: 6px; height: 6px; border-radius: 50%; background: var(--accent2); animation: pulse 1.8s ease infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }

  .content { flex: 1; padding: 28px 28px; }

  /* ── Grid ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .full { grid-column: 1 / -1; }

  /* ── Cards ── */
  .panel {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
  }
  .panel-header {
    padding: 14px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .panel-title { font-size: 13px; font-weight: 600; color: var(--text); }
  .panel-sub   { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .panel-body  { padding: 16px 18px; }
  .panel-body.scroll { max-height: 480px; overflow-y: auto; }

  .section-label {
    font-size: 10px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--muted); margin-bottom: 10px;
  }

  /* ── Metrics grid ── */
  .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .metric {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 14px 12px;
  }
  .metric-val { font-size: 22px; font-weight: 600; line-height: 1; }
  .metric-lbl { font-size: 11px; color: var(--muted); margin-top: 5px; }

  /* ── Regime chips ── */
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 600; padding: 3px 9px;
    border-radius: 999px; letter-spacing: .02em;
  }
  .chip.Bull   { background: var(--bull-bg);   color: var(--bull-fg);   border: 1px solid var(--bull-bd); }
  .chip.Bear   { background: var(--bear-bg);   color: var(--bear-fg);   border: 1px solid var(--bear-bd); }
  .chip.Stress { background: var(--stress-bg); color: var(--stress-fg); border: 1px solid var(--stress-bd); }
  .chip.Range  { background: var(--range-bg);  color: var(--range-fg);  border: 1px solid var(--range-bd); }

  .badge-outline {
    font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 4px;
    border: 1px solid var(--border); color: var(--muted);
  }
  .badge-green  { background: #0a2010; border-color: #1a4020; color: #4caf28; }
  .badge-blue   { background: #081525; border-color: #0e2540; color: #4a9ce0; }
  .badge-orange { background: #1a1005; border-color: #3d2808; color: #e09a30; }
  .badge-purple { background: #130f2a; border-color: #261e50; color: #a09af0; }

  /* ── Progress bar ── */
  .pbar-wrap { height: 4px; background: var(--border); border-radius: 2px; }
  .pbar      { height: 100%; border-radius: 2px; transition: width .4s; }

  /* ── Score bars ── */
  .score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .score-lbl { font-size: 11px; color: var(--muted); width: 68px; flex-shrink: 0; }
  .score-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .score-fill  { height: 100%; border-radius: 3px; transition: width .6s; }
  .score-num   { font-size: 11px; font-weight: 600; width: 32px; text-align: right; }
  .best-tag {
    font-size: 9px; font-weight: 700; letter-spacing: .06em;
    text-transform: uppercase; background: rgba(29,158,117,.15);
    color: var(--accent2); border: 1px solid rgba(29,158,117,.25);
    border-radius: 4px; padding: 1px 6px;
  }

  /* ── Model tabs ── */
  .model-tabs {
    display: flex; gap: 3px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 3px; margin-bottom: 14px;
  }
  .model-tab {
    flex: 1; font-size: 11px; font-weight: 500; padding: 6px 8px;
    border: none; border-radius: 6px; cursor: pointer; transition: all .15s;
    background: transparent; color: var(--muted); text-align: center;
  }
  .model-tab.active {
    background: var(--card); color: var(--text);
    border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(0,0,0,.3);
  }
  .model-tab.best { position: relative; }
  .model-tab.best::after {
    content: '★'; font-size: 8px; position: absolute; top: 2px; right: 4px; color: var(--accent2);
  }

  /* ── Table ── */
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { text-align: left; color: var(--muted); font-weight: 500; padding: 6px 8px; border-bottom: 1px solid var(--border); }
  th:not(:first-child) { text-align: right; }
  td { padding: 6px 8px; border-bottom: 1px solid var(--border); color: var(--text); }
  td:not(:first-child) { text-align: right; }
  tr:last-child td { border-bottom: none; }

  /* ── Transition bars ── */
  .trans-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .trans-lbl { font-size: 11px; color: var(--muted); width: 52px; flex-shrink: 0; }
  .trans-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; }
  .trans-fill  { height: 100%; border-radius: 3px; }
  .trans-pct   { font-size: 11px; font-weight: 600; width: 28px; text-align: right; }

  /* ── SVG chart helpers ── */
  .chart-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
  .chart-top  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .chart-lbl  { font-size: 11px; font-weight: 500; color: var(--muted); }
  .chart-tag  { font-size: 10px; color: var(--muted); }
  .legend     { display: flex; gap: 14px; margin-top: 8px; flex-wrap: wrap; }
  .leg-item   { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--muted); }
  .leg-dot    { width: 8px; height: 8px; border-radius: 2px; }

  /* ── Session cards ── */
  .session-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px; margin-bottom: 10px;
  }
  .session-card:last-child { margin-bottom: 0; }
  .session-row { display: flex; justify-content: space-between; align-items: flex-start; }
  .session-title { font-size: 13px; font-weight: 600; color: var(--text); }
  .session-sub   { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .session-tags  { display: flex; gap: 4px; margin-top: 8px; flex-wrap: wrap; }

  /* ── Source rows ── */
  .source-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .source-row:last-child { border-bottom: none; }
  .source-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .source-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* ── Regime rules ── */
  .regime-rule {
    border-radius: 10px; padding: 12px; margin-bottom: 8px; border: 1px solid;
  }
  .regime-rule.Bull   { background: var(--bull-bg);   border-color: var(--bull-bd); }
  .regime-rule.Bear   { background: var(--bear-bg);   border-color: var(--bear-bd); }
  .regime-rule.Stress { background: var(--stress-bg); border-color: var(--stress-bd); }
  .regime-rule.Range  { background: var(--range-bg);  border-color: var(--range-bd); }
  .regime-rule-title  { font-size: 12px; font-weight: 600; margin-bottom: 6px; }
  .regime-rule.Bull   .regime-rule-title { color: var(--bull-fg); }
  .regime-rule.Bear   .regime-rule-title { color: var(--bear-fg); }
  .regime-rule.Stress .regime-rule-title { color: var(--stress-fg); }
  .regime-rule.Range  .regime-rule-title { color: var(--range-fg); }
  .regime-rule-item   { font-size: 10px; font-family: var(--mono); color: var(--muted); line-height: 1.8; }

  /* ── Profile ── */
  .profile-header {
    display: flex; align-items: center; gap: 14px;
    padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--border);
  }
  .avatar {
    width: 52px; height: 52px; border-radius: 12px; background: rgba(83,74,183,.2);
    border: 1px solid rgba(83,74,183,.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 700; color: #a09af0; flex-shrink: 0;
  }
  .profile-name { font-size: 16px; font-weight: 600; }
  .profile-email{ font-size: 12px; color: var(--muted); margin-top: 2px; }
  .kv-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 0; border-bottom: 1px solid var(--border); font-size: 12px;
  }
  .kv-row:last-child { border-bottom: none; }
  .kv-key   { color: var(--muted); }
  .kv-val   { font-weight: 500; }

  /* ── Loading / Error ── */
  .loader { display: flex; align-items: center; justify-content: center; padding: 60px; color: var(--muted); font-size: 13px; gap: 10px; }
  .spinner2 { width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const Chip = ({ type, children }) => <span className={`chip ${type}`}>{children ?? type}</span>;

const RegimeBg = { Bull: "#0f1f0a", Bear: "#1f0a0a", Stress: "#1f1408", Range: "#0a1220" };
const RegimeFg = { Bull: "#4caf28", Bear: "#e05555", Stress: "#e09a30", Range: "#4a9ce0" };

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [url]);
  return { data, loading, error };
}

function Loader() {
  return <div className="loader"><div className="spinner2" /><span>Loading…</span></div>;
}

// ── Sparkline SVG (price + regime blocks) ─────────────────────────────────────
function RegimeChart({ priceSeries, regimeBlocks, vixSeries }) {
  const W = 320, H = 70;
  const n = priceSeries.length;
  const min = Math.min(...priceSeries), max = Math.max(...priceSeries);
  const px = i => (i / (n - 1)) * W;
  const py = v => H - 4 - ((v - min) / (max - min)) * (H - 8);
  const points = priceSeries.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");

  const VW = 320, VH = 50;
  const vmin = Math.min(...vixSeries), vmax = Math.max(...vixSeries);
  const vpx = i => (i / (vixSeries.length - 1)) * VW;
  const vpy = v => VH - 4 - ((v - vmin) / (vmax - vmin)) * (VH - 8);
  const vpoints = vixSeries.map((v, i) => `${vpx(i).toFixed(1)},${vpy(v).toFixed(1)}`).join(" ");
  const stressY = vpy(25);

  const blockColors = { Bull: "#0f1f0a", Bear: "#1f0a0a", Stress: "#1f1408", Range: "#0a1220" };
  const blockBorders = { Bull: "#1e3d10", Bear: "#3d1010", Stress: "#3d2a08", Range: "#0e2540" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="chart-wrap">
        <div className="chart-top">
          <span className="chart-lbl">S&P 500 + Regimes</span>
          <span className="chart-tag">2020–2024</span>
        </div>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          {regimeBlocks.map((b, i) => {
            const x = px(b.start), w = px(b.end) - px(b.start);
            return (
              <rect key={i} x={x} y={0} width={w} height={H}
                fill={blockColors[b.regime] || "#111"} opacity="0.8" rx="2" />
            );
          })}
          <polyline points={points} fill="none" stroke="#534AB7" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <div className="legend">
          {Object.entries(RegimeBg).map(([k, bg]) => (
            <div key={k} className="leg-item">
              <div className="leg-dot" style={{ background: bg, border: `1px solid ${RegimeFg[k]}` }} />
              {k}
            </div>
          ))}
        </div>
      </div>

      <div className="chart-wrap">
        <div className="chart-top">
          <span className="chart-lbl">VIX — Fear Index</span>
        </div>
        <svg width="100%" viewBox={`0 0 ${VW} ${VH}`}>
          <line x1="0" y1={stressY} x2={VW} y2={stressY}
            stroke="#e05555" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.5" />
          <polyline points={vpoints} fill="none" stroke="#e09a30" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
          — stress threshold (VIX &gt; 25)
        </div>
      </div>
    </div>
  );
}

// ── Regime Detail panel ───────────────────────────────────────────────────────
function RegimeDetail({ regime, stats, transitions }) {
  const type = regime?.type || "Bull";
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Current Regime — Detail</div>
          <div className="panel-sub">Statistics & transitions</div>
        </div>
        <Chip type={type}>{type}</Chip>
      </div>
      <div className="panel-body scroll">
        <div style={{
          background: RegimeBg[type], border: `1px solid ${RegimeFg[type]}33`,
          borderRadius: 10, padding: 12, marginBottom: 14
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: RegimeFg[type], marginBottom: 4 }}>
            {regime?.label}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
            {regime?.description}
          </div>
        </div>

        <div className="section-label">Regime Statistics</div>
        {stats?.map((s, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", padding: "8px 0",
            borderBottom: i < stats.length - 1 ? "1px solid var(--border)" : "none",
            fontSize: 12
          }}>
            <span style={{ color: "var(--muted)" }}>{s.label}</span>
            <span style={{ fontWeight: 600, color: s.color || "var(--text)" }}>{s.value}</span>
          </div>
        ))}

        <div className="section-label" style={{ marginTop: 14 }}>Likely Transitions</div>
        {transitions?.map((t, i) => (
          <div key={i} className="trans-row">
            <span className="trans-lbl">→ {t.to}</span>
            <div className="trans-track">
              <div className="trans-fill" style={{ width: `${t.prob}%`, background: t.color }} />
            </div>
            <span className="trans-pct" style={{ color: t.color }}>{t.prob}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PAGES ─────────────────────────────────────────────────────────────────────

function DashboardPage() {
  const { data, loading } = useFetch(`${API}/dashboard`);
  const { data: models } = useFetch(`${API}/models`);

  if (loading || !data) return <Loader />;

  const { current_regime, metrics, price_series, vix_series, regime_blocks, transitions, regime_detail } = data;

  return (
    <div className="two-col">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Current regime banner */}
        <div className="panel" style={{ borderLeft: `3px solid ${RegimeFg[current_regime.type]}` }}>
          <div className="panel-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
                  Current Regime · S&P 500
                </div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{current_regime.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>
                  Updated {current_regime.updated} · Model:{" "}
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>{current_regime.model}</span>
                  {" "}<span className="best-tag">auto-selected</span>
                </div>
              </div>
              <Chip type={current_regime.type}>{current_regime.type}</Chip>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="metrics-grid">
          {[
            { val: metrics.avg_return,  lbl: "Avg Return",     color: "#4caf28" },
            { val: metrics.avg_vix,     lbl: "Avg VIX",        color: "#e09a30" },
            { val: metrics.annual_vol,  lbl: "Annual Vol.",     color: null },
            { val: metrics.max_drawdown,lbl: "Max Drawdown",    color: null },
          ].map((m, i) => (
            <div key={i} className="metric">
              <div className="metric-val" style={m.color ? { color: m.color } : {}}>{m.val}</div>
              <div className="metric-lbl">{m.lbl}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <RegimeChart priceSeries={price_series} regimeBlocks={regime_blocks} vixSeries={vix_series} />
      </div>

      {/* Right col: regime detail */}
      <RegimeDetail
        regime={{ ...current_regime, description: regime_detail?.description }}
        stats={regime_detail?.stats}
        transitions={transitions}
      />
    </div>
  );
}

function AnalysisPage({ bestModel }) {
  const { data, loading } = useFetch(`${API}/analysis`);
  const [activeModel, setActiveModel] = useState(null);

  useEffect(() => {
    if (data && !activeModel) setActiveModel(data.best_model);
  }, [data]);

  if (loading || !data) return <Loader />;

  const { model_scores, regime_stats, interpretation, best_model_detail } = data;
  const stats = regime_stats[activeModel] || [];

  const scoreColors = { "K-Means": "#534AB7", "GMM": "#1D9E75", "HMM": "#D85A30" };

  return (
    <div className="two-col">
      {/* Left: model comparison */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Model Comparison</div>
              <div className="panel-sub">Silhouette scores · auto-select enabled</div>
            </div>
          </div>
          <div className="panel-body">
            <div className="model-tabs">
              {Object.keys(model_scores).map(m => (
                <button
                  key={m}
                  className={`model-tab${activeModel === m ? " active" : ""}${m === data.best_model ? " best" : ""}`}
                  onClick={() => setActiveModel(m)}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="section-label">Accuracy Scores</div>
            {Object.entries(model_scores).map(([name, score]) => (
              <div key={name} className="score-row">
                <span className="score-lbl">{name}</span>
                <div className="score-track">
                  <div className="score-fill" style={{
                    width: `${score * 100}%`,
                    background: scoreColors[name] || "#534AB7"
                  }} />
                </div>
                <span className="score-num" style={{ color: scoreColors[name] }}>
                  {score.toFixed(2)}
                </span>
                {name === data.best_model && <span className="best-tag">best</span>}
              </div>
            ))}

            <div className="section-label" style={{ marginTop: 14 }}>
              Regime Metrics — {activeModel}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Regime</th>
                  <th>Return</th>
                  <th>Vol</th>
                  <th>VIX</th>
                  <th>Dur.</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr key={i}>
                    <td><Chip type={s.regime} /></td>
                    <td style={{ color: s.return > 0 ? "#4caf28" : "#e05555", fontWeight: 600 }}>
                      {s.return > 0 ? "+" : ""}{s.return}%
                    </td>
                    <td>{s.vol}%</td>
                    <td>{s.vix}</td>
                    <td>{s.duration}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best model highlight */}
        <div className="panel" style={{ borderLeft: `3px solid ${scoreColors[data.best_model]}` }}>
          <div className="panel-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{best_model_detail.name} recommended</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                  Silhouette score: {best_model_detail.score.toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                  {best_model_detail.reason}
                </div>
              </div>
              <span className="badge-outline badge-green">Optimal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: interpretation */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Economic Interpretation</div>
            <div className="panel-sub">Rule-based regime definitions</div>
          </div>
        </div>
        <div className="panel-body scroll">
          {interpretation.map((item, i) => (
            <div key={i} className={`regime-rule ${item.type}`}>
              <div className="regime-rule-title">{item.regime}</div>
              {item.rules.map((r, j) => (
                <div key={j} className="regime-rule-item">{r}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SessionsPage() {
  const { data: sessData, loading: sLoad } = useFetch(`${API}/sessions`);
  const { data: srcData, loading: srcLoad } = useFetch(`${API}/sources`);

  if (sLoad || srcLoad) return <Loader />;

  const statusBadge = (s) => {
    if (s.status === "done")    return <span className="badge-outline badge-green">Done</span>;
    if (s.status === "running") return <span className="badge-outline badge-blue">Running</span>;
    return <span className="badge-outline badge-orange">Waiting</span>;
  };

  return (
    <div className="two-col">
      {/* Sessions */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Analysis Sessions</div>
            <div className="panel-sub">{sessData.sessions.length} sessions</div>
          </div>
        </div>
        <div className="panel-body scroll">
          {sessData.sessions.map(s => (
            <div key={s.id} className="session-card">
              <div className="session-row">
                <div>
                  <div className="session-title">{s.title}</div>
                  <div className="session-sub">{s.model} · {s.regimes} regimes</div>
                </div>
                {statusBadge(s)}
              </div>
              {s.status === "running" && (
                <div style={{ marginTop: 8 }}>
                  <div className="pbar-wrap"><div className="pbar" style={{ width: `${s.progress}%`, background: "#4a9ce0" }} /></div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{s.progress}% — {s.progress_label}</div>
                </div>
              )}
              {s.status === "waiting" && (
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>Queue position #{s.queue_pos}</div>
              )}
              {s.tags && (
                <div className="session-tags">
                  {s.tags.map(t => <Chip key={t} type={t} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Data Sources</div>
            <div className="panel-sub">{srcData.sources.filter(s => s.status === "active").length} active</div>
          </div>
        </div>
        <div className="panel-body">
          {srcData.sources.map(s => (
            <div key={s.id} className="source-row">
              <div>
                <div className="source-name">{s.name}</div>
                <div className="source-meta">{s.type} · {s.days.toLocaleString()} days</div>
              </div>
              <span className={`badge-outline ${s.status === "active" ? "badge-green" : ""}`}>
                {s.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { data, loading } = useFetch(`${API}/profile`);
  if (loading || !data) return <Loader />;

  const initials = data.name.split(" ").map(n => n[0]).join("");

  return (
    <div className="two-col">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">My Profile</div>
        </div>
        <div className="panel-body">
          <div className="profile-header">
            <div className="avatar">{initials}</div>
            <div>
              <div className="profile-name">{data.name}</div>
              <div className="profile-email">{data.email}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <span className="badge-outline badge-purple">{data.plan}</span>
                <span className="badge-outline badge-green">Active</span>
              </div>
            </div>
          </div>

          <div className="section-label">Account Info</div>
          {[
            ["Name",          data.name],
            ["Email",         data.email],
            ["Member since",  data.member_since],
            ["Plan",          data.plan],
          ].map(([k, v]) => (
            <div key={k} className="kv-row">
              <span className="kv-key">{k}</span>
              <span className="kv-val">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Advanced Settings</div>
        </div>
        <div className="panel-body">
          <div className="section-label">Preferences</div>
          {[
            ["Default model",  <span style={{ color: "var(--accent)", fontWeight: 600 }}>{data.preferences.default_model} <span className="best-tag">auto</span></span>],
            ["Nb regimes",     data.preferences.num_regimes],
            ["Notifications",  data.preferences.notifications ? "On" : "Off"],
            ["Dark mode",      data.preferences.dark_mode ? "On" : "Off"],
          ].map(([k, v], i) => (
            <div key={i} className="kv-row">
              <span className="kv-key">{k}</span>
              <span className="kv-val">{v}</span>
            </div>
          ))}

          <div className="section-label" style={{ marginTop: 16 }}>API & Export</div>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: 12, marginBottom: 10
          }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>API Key</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{data.api_key}</div>
          </div>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: 12
          }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Export results</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["JSON", "CSV", "PDF"].map(fmt => (
                <button key={fmt} style={{
                  flex: 1, fontSize: 11, padding: "6px 0",
                  background: "transparent", border: "1px solid var(--border)",
                  borderRadius: 6, color: "var(--muted)", cursor: "pointer"
                }}>{fmt}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Auth page (static, no API needed) ────────────────────────────────────────
function AuthPage() {
  return (
    <div className="two-col">
      {["Register", "Login"].map((mode, idx) => (
        <div key={mode} className="panel">
          <div className="panel-header"><div className="panel-title">{mode}</div></div>
          <div className="panel-body">
            {idx === 0 && (
              <>
                {[["Full name","text","Alice Dupont"],["Email","email","alice@email.com"],["Password","password","••••••••"],["Confirm","password","••••••••"]].map(([lbl,type,ph]) => (
                  <div key={lbl} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>{lbl}</label>
                    <input type={type} placeholder={ph} style={{
                      width:"100%", background:"var(--surface)", border:"1px solid var(--border)",
                      borderRadius:8, padding:"9px 12px", fontSize:13, color:"var(--text)", fontFamily:"var(--font)"
                    }} />
                  </div>
                ))}
              </>
            )}
            {idx === 1 && (
              <>
                {[["Email","email","alice@email.com"],["Password","password","••••••••"]].map(([lbl,type,ph]) => (
                  <div key={lbl} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>{lbl}</label>
                    <input type={type} placeholder={ph} style={{
                      width:"100%", background:"var(--surface)", border:"1px solid var(--border)",
                      borderRadius:8, padding:"9px 12px", fontSize:13, color:"var(--text)", fontFamily:"var(--font)"
                    }} />
                  </div>
                ))}
              </>
            )}
            <button style={{
              width:"100%", padding:"11px", background:"var(--accent)", border:"none",
              borderRadius:8, fontSize:13, fontWeight:600, color:"#fff", cursor:"pointer",
              fontFamily:"var(--font)", marginTop: 4
            }}>{idx === 0 ? "Create account" : "Sign in"}</button>
            <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:"var(--muted)" }}>
              {idx === 0 ? <>Already registered? <span style={{color:"var(--accent)",cursor:"pointer"}}>Sign in</span></>
                         : <>No account? <span style={{color:"var(--accent)",cursor:"pointer"}}>Register</span></>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
const TABS = ["Dashboard", "Analysis", "Sessions", "Auth", "Profile"];

export default function MarketRegimeDashboard() {
  const [tab, setTab] = useState("Dashboard");
  const { data: modelsData } = useFetch(`${API}/models`);

  const bestModel = modelsData?.best_model || null;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <nav className="topnav">
          <div className="brand">
            <div className="brand-icon">M</div>
            Market Regime
          </div>
          <div className="nav-tabs">
            {TABS.map(t => (
              <button key={t} className={`nav-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="nav-right">
            {bestModel && (
              <div className="best-model-badge">
                <div className="dot-live" />
                Auto: <strong style={{ marginLeft: 4 }}>{bestModel}</strong>
              </div>
            )}
          </div>
        </nav>

        <div className="content">
          {tab === "Dashboard" && <DashboardPage />}
          {tab === "Analysis"  && <AnalysisPage bestModel={bestModel} />}
          {tab === "Sessions"  && <SessionsPage />}
          {tab === "Auth"      && <AuthPage />}
          {tab === "Profile"   && <ProfilePage />}
        </div>
      </div>
    </>
  );
}
