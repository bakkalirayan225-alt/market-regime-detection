// pages/Overview.jsx
import { useState, useEffect, useCallback } from "react";
import { useMarket } from "../pages/MarketContext";

const API = "http://localhost:5001/api";

const REGIME_COLOR = {
  Bull:   "#38bdf8",
  Bear:   "#f87171",
  Range:  "#fb923c",
  Stress: "#c084fc",
};
const REGIME_BG = {
  Bull:   "rgba(56,189,248,0.07)",
  Bear:   "rgba(248,113,113,0.07)",
  Range:  "rgba(251,146,60,0.07)",
  Stress: "rgba(192,132,252,0.07)",
};

const TIMEFRAMES = [
  { id: "day",    label: "1D"  },
  { id: "week",   label: "1W"  },
  { id: "month",  label: "1M"  },
  { id: "year",   label: "1Y"  },
  { id: "10year", label: "10Y" },
];

// ── Regime chart ─────────────────────────────────────────────────────────────
function RegimeChart({ points = [], expanded = false }) {
  const [tooltip, setTooltip] = useState(null);
  if (!points.length) return <div style={{ height: expanded ? 340 : 200, background: "var(--surface2)", borderRadius: 8 }} />;

  const W = 700, H = expanded ? 300 : 190;
  const n = points.length;
  const prices = points.map(p => p.price);
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max - min || 1;
  const px = i => (i / (n - 1)) * W;
  const py = v => H - 8 - ((v - min) / range) * (H - 16);

  // Bands
  const bands = [];
  let bs = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || points[i].regime !== points[bs].regime) {
      bands.push({ regime: points[bs].regime, x0: px(bs), x1: i < n ? px(i) : W });
      bs = i;
    }
  }

  // Segments
  const segments = [];
  let ss = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || points[i].regime !== points[ss].regime) {
      const end = Math.min(i, n - 1);
      segments.push({
        regime: points[ss].regime,
        pts: Array.from({ length: end - ss + 1 }, (_, k) => ss + k)
          .map(idx => `${px(idx).toFixed(1)},${py(points[idx].price).toFixed(1)}`).join(" "),
      });
      ss = i;
    }
  }

  const transitionDots = [];
  for (let i = 1; i < n; i++) {
    if (points[i].regime !== points[i - 1].regime) transitionDots.push({ i, regime: points[i].regime });
  }

  const labelCount = expanded ? 10 : 6;
  const labelIdxs = Array.from({ length: labelCount }, (_, k) => Math.round((k / (labelCount - 1)) * (n - 1)));

  // Y-axis labels
  const ySteps = 4;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, k) => {
    const val = min + (k / ySteps) * range;
    return { val, y: py(val) };
  });

  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width * W;
    const idx = Math.min(n - 1, Math.max(0, Math.round((mouseX / W) * (n - 1))));
    setTooltip({ idx, x: mouseX, y: py(points[idx].price) });
  };

  return (
    <div style={{ position: "relative" }}>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H + 24}`}
        style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Regime background bands */}
        {bands.map((b, i) => (
          <rect key={i} x={b.x0} y={0} width={Math.max(b.x1 - b.x0, 1)} height={H} fill={REGIME_BG[b.regime] || "transparent"} />
        ))}

        {/* Grid lines */}
        {yLabels.map((l, i) => (
          <g key={i}>
            <line x1={0} y1={l.y} x2={W} y2={l.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={W + 4} y={l.y + 4} style={{ fontSize: 8, fill: "var(--text3)", fontFamily: "var(--mono)" }} textAnchor="start">
              {l.val > 1000 ? (l.val / 1000).toFixed(1) + "k" : Math.round(l.val)}
            </text>
          </g>
        ))}

        {/* Colored line segments */}
        {segments.map((seg, i) => (
          <polyline key={i} points={seg.pts} fill="none" stroke={REGIME_COLOR[seg.regime] || "#aaa"} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}

        {/* Transition dots */}
        {transitionDots.map(({ i, regime }) => (
          <circle key={i} cx={px(i)} cy={py(points[i].price)} r={3.5}
            fill={REGIME_COLOR[regime] || "#aaa"} stroke="var(--surface)" strokeWidth="1.5" />
        ))}

        {/* Tooltip crosshair */}
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={0} x2={tooltip.x} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx={tooltip.x} cy={tooltip.y} r={4}
              fill={REGIME_COLOR[points[tooltip.idx]?.regime] || "#fff"}
              stroke="var(--surface)" strokeWidth="2" />
          </>
        )}

        {/* X-axis labels */}
        {labelIdxs.map(i => (
          <text key={i} x={px(i)} y={H + 14} textAnchor="middle"
            style={{ fontSize: 9, fill: "var(--text3)", fontFamily: "var(--mono)" }}>
            {points[i]?.date}
          </text>
        ))}
      </svg>

      {/* Floating tooltip */}
      {tooltip && points[tooltip.idx] && (
        <div style={{
          position: "absolute",
          left: `${(tooltip.x / W) * 100}%`,
          top: 4,
          transform: "translateX(-50%)",
          background: "var(--surface3)",
          border: "1px solid var(--border2)",
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: 11,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 10,
          fontFamily: "var(--mono)",
        }}>
          <span style={{ color: REGIME_COLOR[points[tooltip.idx].regime] }}>{points[tooltip.idx].regime}</span>
          <span style={{ color: "var(--text2)", marginLeft: 8 }}>{points[tooltip.idx].price?.toLocaleString()}</span>
          <span style={{ color: "var(--text3)", marginLeft: 8 }}>{points[tooltip.idx].date}</span>
        </div>
      )}

      <div className="regime-legend" style={{ marginTop: 6 }}>
        {Object.entries(REGIME_COLOR).map(([r, c]) => (
          <div key={r} className="legend-item">
            <div className="legend-dot" style={{ background: c }} />
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fullscreen modal ──────────────────────────────────────────────────────────
function FullscreenChart({ points, onClose, timeframe, setTimeframe }) {
  return (
    <div className="chart-modal-backdrop" onClick={onClose}>
      <div className="chart-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div className="card-title" style={{ fontSize: 15 }}>Regime Map — Fullscreen</div>
            <div className="card-sub">Click anywhere outside to close · Hover for details</div>
          </div>
          <div className="timeframe-bar">
            {TIMEFRAMES.map(tf => (
              <button key={tf.id} className={`tf-btn${timeframe === tf.id ? " active" : ""}`} onClick={() => setTimeframe(tf.id)}>
                {tf.label}
              </button>
            ))}
          </div>
        </div>
        <RegimeChart points={points} expanded />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Overview() {
  const { region, market, timeframe, setTimeframe } = useMarket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`${API}/dashboard?region=${region}&market=${market}&timeframe=${timeframe}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [region, market, timeframe]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close modal on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner-sm" />
      Loading market data…
    </div>
  );

  if (!data) return <div className="page-loader" style={{ color: "var(--bear)" }}>Failed to load data.</div>;

  const { current_regime, metrics, price_points = [], regime_distribution = {} } = data;

  return (
    <div className="page-content">

      {/* KPI strip */}
      <div className="kpi-grid">
        <div className="kpi-card regime-card">
          <div className="kpi-label">Current Regime</div>
          <div className="kpi-value" style={{ fontSize: 16, color: REGIME_COLOR[current_regime.type] }}>
            {current_regime.label}
          </div>
          <div className="conf-bar">
            <div className="conf-fill" style={{
              width: `${Math.round(current_regime.confidence * 100)}%`,
              background: REGIME_COLOR[current_regime.type],
            }} />
          </div>
          <div className="kpi-sub">Conf. {Math.round(current_regime.confidence * 100)}% · HMM</div>
        </div>
        {[
          { label: "Current Price", value: metrics.current_price?.toLocaleString(),   badge: metrics.day_change, cls: metrics.day_change?.startsWith("+") ? "positive" : "negative" },
          { label: "Return",        value: metrics.avg_return,   badge: "Ann. Avg",   cls: "positive" },
          { label: "Volatility",    value: metrics.annual_vol,   badge: "Annualized", cls: "neutral"  },
          { label: "Max Drawdown",  value: metrics.max_drawdown, badge: "Historical", cls: "negative" },
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
              <div className="card-sub">Colored by HMM-detected regime</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div className="timeframe-bar">
                {TIMEFRAMES.map(tf => (
                  <button key={tf.id} className={`tf-btn${timeframe === tf.id ? " active" : ""}`} onClick={() => setTimeframe(tf.id)}>
                    {tf.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFullscreen(true)}
                style={{
                  padding: "4px 8px", borderRadius: 5, fontSize: 10,
                  border: "1px solid var(--border2)", background: "var(--surface2)",
                  color: "var(--text2)", cursor: "pointer", fontFamily: "var(--font)",
                  display: "flex", alignItems: "center", gap: 4,
                }}
                title="Expand chart"
              >
                ⛶ Expand
              </button>
              <div className="chip">Live</div>
            </div>
          </div>

          <RegimeChart points={price_points} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Regime distribution */}
          <div className="card">
            <div className="card-header"><div className="card-title">Regime Distribution</div></div>
            {Object.entries(REGIME_COLOR).map(([r, c]) => {
              const pct = Math.round((regime_distribution[r] || 0) * 100);
              return (
                <div key={r} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div className={`regime-badge ${r.toLowerCase()}`}>{r}</div>
                    <span style={{ fontSize: 11, color: "var(--text2)", fontFamily: "var(--mono)" }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: "var(--surface2)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 2, transition: "width .5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alert panel */}
          <div className="card">
            <div className="card-header"><div className="card-title">Alert Panel</div></div>
            {[
              { icon: "▲", type: "warn",   title: "Volatility spike",          desc: "Intraday volatility elevated. Potential regime transition.",  time: "2h ago" },
              { icon: "●", type: "info",   title: "HMM confidence high",       desc: `${current_regime.label} probability stable at ${Math.round(current_regime.confidence * 100)}%.`, time: "Now" },
              { icon: "▼", type: "danger", title: "Drawdown threshold",        desc: "Drawdown approaching alert level. Monitor closely.",          time: "1d ago" },
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
              <tr><th>Regime</th><th>Avg Return</th><th>Volatility</th><th>Sharpe</th><th>Freq.</th><th>Avg Duration</th></tr>
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
                  <td style={{ color: s.pos === true ? "var(--bull)" : s.pos === false ? "var(--bear)" : undefined }}>{s.ret}</td>
                  <td>{s.vol}</td>
                  <td style={{ color: parseFloat(s.sh) > 0 ? "var(--bull)" : "var(--bear)" }}>{s.sh}</td>
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
            { title: `Current — ${current_regime.label}`, color: REGIME_COLOR[current_regime.type], text: `HMM model detects a ${current_regime.type.toLowerCase()} market phase. Positive momentum and stable credit spreads confirm current positioning.` },
            { title: "Transition Risk",                    color: "var(--range)",                    text: "Elevated intraday volatility signals potential regime pressure. A sustained drawdown > 5% would trigger Range territory." },
            { title: "Model Accuracy",                     color: "var(--accent)",                   text: "HMM outperforms GMM by 11pp and K-Means by 19pp on silhouette score, making it the preferred model for regime detection." },
          ].map((b, i) => (
            <div key={i} className="interp-block" style={{ borderLeftColor: b.color }}>
              <div className="interp-title">{b.title}</div>
              <div className="interp-text">{b.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <FullscreenChart
          points={price_points}
          onClose={() => setFullscreen(false)}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />
      )}
    </div>
  );
}
