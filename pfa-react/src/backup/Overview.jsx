// pages/Overview.jsx
import { useState, useEffect } from "react";
const API = "http://localhost:5001/api";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(url).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [url]);
  return { data, loading };
}

const REGIME_LINE_COLOR = {
  Bull:   "#4ade80",
  Bear:   "#f87171",
  Range:  "#fb923c",
  Stress: "#c084fc",
};

const REGIME_BG_COLOR = {
  Bull:   "rgba(74,222,128,0.08)",
  Bear:   "rgba(248,113,113,0.08)",
  Range:  "rgba(251,146,60,0.08)",
  Stress: "rgba(192,132,252,0.08)",
};

// Segments the price series into contiguous same-regime runs,
// then draws each run as a separate colored polyline.
// Each point shape: { price, date, regime, vix? }
function RegimeChart({ points = [] }) {
  if (!points.length) return null;

  const W = 600, H = 200;
  const n = points.length;
  const prices = points.map(p => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const px = i => (i / (n - 1)) * W;
  const py = v => H - 8 - ((v - min) / range) * (H - 16);

  // Background bands — contiguous spans of same regime
  const bands = [];
  let bandStart = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || points[i].regime !== points[bandStart].regime) {
      bands.push({
        regime: points[bandStart].regime,
        x0: px(bandStart),
        x1: i < n ? px(i) : W,
      });
      bandStart = i;
    }
  }

  // Line segments — same logic, each polyline one regime color
  const segments = [];
  let segStart = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || points[i].regime !== points[segStart].regime) {
      // Extend one point into the next segment so lines connect seamlessly
      const end = Math.min(i, n - 1);
      segments.push({
        regime: points[segStart].regime,
        pts: Array.from({ length: end - segStart + 1 }, (_, k) => segStart + k)
          .map(idx => `${px(idx).toFixed(1)},${py(points[idx].price).toFixed(1)}`)
          .join(" "),
      });
      segStart = i;
    }
  }

  // Transition dot positions
  const transitionDots = [];
  for (let i = 1; i < n; i++) {
    if (points[i].regime !== points[i - 1].regime) {
      transitionDots.push({ i, regime: points[i].regime });
    }
  }

  // X-axis: 6 evenly spaced date labels
  const labelIndices = Array.from({ length: 6 }, (_, k) =>
    Math.round((k / 5) * (n - 1))
  );

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} style={{ display: "block" }}>
        {/* Regime background bands */}
        {bands.map((b, i) => (
          <rect key={i} x={b.x0} y={0}
            width={Math.max(b.x1 - b.x0, 1)} height={H}
            fill={REGIME_BG_COLOR[b.regime] || "transparent"} />
        ))}

        {/* Subtle horizontal grid */}
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t}
            x1={0} y1={py(min + t * range)}
            x2={W} y2={py(min + t * range)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}

        {/* Colored line segments */}
        {segments.map((seg, i) => (
          <polyline key={i} points={seg.pts} fill="none"
            stroke={REGIME_LINE_COLOR[seg.regime] || "#aaa"}
            strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}

        {/* Transition dots where regime changes */}
        {transitionDots.map(({ i, regime }) => (
          <circle key={i}
            cx={px(i)} cy={py(points[i].price)} r={3.5}
            fill={REGIME_LINE_COLOR[regime] || "#aaa"}
            stroke="var(--surface)" strokeWidth="1.5" />
        ))}

        {/* X-axis date labels */}
        {labelIndices.map(i => (
          <text key={i} x={px(i)} y={H + 14} textAnchor="middle"
            style={{ fontSize: 9, fill: "var(--text3)", fontFamily: "inherit" }}>
            {points[i]?.date}
          </text>
        ))}
      </svg>

      <div className="regime-legend" style={{ marginTop: 4 }}>
        {Object.entries(REGIME_LINE_COLOR).map(([regime, color]) => (
          <div key={regime} className="legend-item">
            <div className="legend-dot" style={{ background: color }} />
            {regime}
          </div>
        ))}
      </div>
    </div>
  );
}

function VixChart({ points = [] }) {
  if (!points.length) return null;
  const vals = points.map(p => p.vix ?? 15);
  const W = 600, H = 70;
  const n = points.length;
  const min = Math.min(...vals), max = Math.max(...vals);
  const px = i => (i / (n - 1)) * W;
  const py = v => H - 4 - ((v - min) / (max - min || 1)) * (H - 8);
  const pts = vals.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const stressY = py(25);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <line x1={0} y1={stressY} x2={W} y2={stressY}
        stroke="#f87171" strokeWidth="0.75" strokeDasharray="4 3" opacity="0.5" />
      <polyline points={pts} fill="none"
        stroke="#fb923c" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function Overview() {
  const { data: dash } = useFetch(`${API}/dashboard`);
  const { data: models } = useFetch(`${API}/models`);

  if (!dash || !models) return <div className="page-loader">Loading…</div>;

  const { current_regime, metrics } = dash;
  // Expects dash.price_points = [{ price, date, regime, vix? }, ...]
  const pricePoints = dash.price_points ?? [];
  const hasVix = pricePoints.some(p => p.vix != null);

  return (
    <div className="page-content">
      {/* KPI strip */}
      <div className="kpi-grid">
        <div className="kpi-card regime-card">
          <div className="kpi-label">Current Regime</div>
          <div className="kpi-value" style={{ fontSize: 17 }}>{current_regime.label}</div>
          <div className="conf-bar">
            <div className="conf-fill" style={{
              width: "87%",
              background: REGIME_LINE_COLOR[current_regime.type] || "#4ade80",
            }} />
          </div>
          <div className="kpi-sub" style={{ color: "rgba(255,255,255,0.4)" }}>
            Conf. 87% · {current_regime.model}
          </div>
        </div>
        {[
          { label: "Confidence",   value: "87%",                badge: "▲ +4.2pp", cls: "positive" },
          { label: "Return",       value: metrics.avg_return,   badge: "▲ Daily",  cls: "positive" },
          { label: "Volatility",   value: metrics.annual_vol,   badge: "Ann.",      cls: "neutral"  },
          { label: "VIX",          value: String(metrics.avg_vix), badge: "Low vol.", cls: "neutral" },
          { label: "Max Drawdown", value: metrics.max_drawdown, badge: "▼ MTD",    cls: "negative" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className={`kpi-badge ${k.cls}`}>{k.badge}</div>
          </div>
        ))}
      </div>

      {/* Chart + right column */}
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">S&P 500 — Regime Map</div>
              <div className="card-sub">
                Line colored by detected regime · {current_regime.model} model
              </div>
            </div>
            <div className="chip">Live</div>
          </div>

          <RegimeChart points={pricePoints} />

          {hasVix && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 6 }}>
                VIX — dashed line = stress threshold (25)
              </div>
              <VixChart points={pricePoints} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Model comparison */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header"><div className="card-title">Model Comparison</div></div>
            {models.models.map(m => (
              <div key={m.name} className="model-score">
                <span className="model-name" style={m.best ? { color: "var(--g500)" } : {}}>
                  {m.name}{m.best ? " ★" : ""}
                </span>
                <div className="score-bar-wrap">
                  <div className="score-bar" style={{
                    width: `${m.score * 100}%`,
                    background: m.best ? "#4ade80" : m.name === "GMM" ? "#60a5fa" : "#fb923c",
                  }} />
                </div>
                <span className="score-val" style={m.best ? { color: "var(--g500)" } : {}}>
                  {Math.round(m.score * 100)}%
                </span>
              </div>
            ))}
          </div>

          {/* Alert panel */}
          <div className="card">
            <div className="card-header"><div className="card-title">Alert Panel</div></div>
            {[
              { icon: "▲", type: "warn",   title: "VIX spike detected",  desc: "VIX crossed 20 intraday. Potential regime transition.", time: "2h ago" },
              { icon: "●", type: "info",   title: "HMM confidence high", desc: "Bull regime probability stable at 87%.", time: "Now" },
              { icon: "▼", type: "danger", title: "Drawdown threshold",  desc: "-4.8% MTD drawdown approaching -5% alert level.", time: "1d ago" },
            ].map((a, i) => (
              <div key={i} className="alert-row">
                <div className={`alert-icon ${a.type}`}>{a.icon}</div>
                <div className="alert-content">
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-desc">{a.desc}</div>
                  <div className="alert-time">{a.time}</div>
                </div>
                <div className={`active-indicator ${a.type}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats table + interpretation */}
      <div className="two-col">
        <div className="card">
          <div className="card-header"><div className="card-title">Regime Statistics</div></div>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Regime</th><th>Avg Return</th><th>Volatility</th>
                <th>Sharpe</th><th>Freq.</th><th>Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {[
                { r: "Bull",   ret: "+18.4%", vol: "11.2%", sh: "1.64",  freq: "41%", dur: "218d", pos: true  },
                { r: "Bear",   ret: "-22.1%", vol: "28.6%", sh: "-0.77", freq: "18%", dur: "94d",  pos: false },
                { r: "Range",  ret: "+3.1%",  vol: "14.3%", sh: "0.22",  freq: "28%", dur: "145d", pos: null  },
                { r: "Stress", ret: "-8.9%",  vol: "38.4%", sh: "-0.23", freq: "13%", dur: "31d",  pos: false },
              ].map(s => (
                <tr key={s.r}>
                  <td><div className={`regime-badge ${s.r.toLowerCase()}`}>{s.r}</div></td>
                  <td style={{ color: s.pos === true ? "#16a34a" : s.pos === false ? "#b91c1c" : undefined }}>{s.ret}</td>
                  <td>{s.vol}</td>
                  <td style={{ color: parseFloat(s.sh) > 0 ? "#16a34a" : "#b91c1c" }}>{s.sh}</td>
                  <td>{s.freq}</td>
                  <td>{s.dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Economic Interpretation</div></div>
          {[
            { title: "Current Regime — Bull Market", color: "var(--g500)", text: "The HMM model detects a sustained expansion phase. Low VIX (18.6), positive momentum, and stable credit spreads confirm risk-on positioning." },
            { title: "Transition Risk",               color: "#fb923c",    text: "Intraday VIX spike signals potential regime pressure. A move above 22 would downgrade confidence to Range territory." },
            { title: "Model Divergence",              color: "#60a5fa",    text: "K-Means lags HMM by ~11pp. Discrepancy suggests latent volatility not yet reflected in clustering." },
          ].map((b, i) => (
            <div key={i} className="interp-block" style={{ borderLeftColor: b.color }}>
              <div className="interp-title">{b.title}</div>
              <div className="interp-text">{b.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
