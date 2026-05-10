// pages/Regimes.jsx
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

const REGIME_META = {
  Bull: {
    cls: "bull", color: "#4ade80", bg: "rgba(74,222,128,0.07)", border: "rgba(74,222,128,0.2)",
    desc: "Sustained positive returns, low volatility, risk-on sentiment. VIX below 20. Credit spreads tight.",
    entry: ["Returns > 0 for 20+ days", "VIX < 20", "Drawdown < 5%"],
    exit:  ["VIX crosses 22", "Returns turn negative 3 consecutive days", "Drawdown > 8%"],
  },
  Bear: {
    cls: "bear", color: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.2)",
    desc: "Sustained negative returns, elevated volatility, risk-off sentiment. VIX elevated above 25.",
    entry: ["Returns < 0 for 10+ days", "VIX > 25", "Drawdown > 10%"],
    exit:  ["VIX drops below 22", "Returns stabilize above 0", "Drawdown recovery > 5%"],
  },
  Range: {
    cls: "range", color: "#fb923c", bg: "rgba(251,146,60,0.07)", border: "rgba(251,146,60,0.2)",
    desc: "Directionless price action, moderate volatility. Typical transition period between trending regimes.",
    entry: ["Returns flat ±1% for 15+ days", "VIX 20–25", "No clear trend direction"],
    exit:  ["Breakout above resistance", "VIX moves outside 20–25 band", "Return momentum > 1.5%"],
  },
  Stress: {
    cls: "stress", color: "#c084fc", bg: "rgba(192,132,252,0.07)", border: "rgba(192,132,252,0.2)",
    desc: "Crisis conditions. Extreme volatility, panic selling, VIX spike above 35. Rare but severe.",
    entry: ["VIX > 35", "Drawdown > 15%", "Intraday swings > 3%"],
    exit:  ["VIX drops below 30 for 5 days", "Policy intervention signals", "Returns stabilize"],
  },
};

const REGIME_STATS = {
  Bull:   [{ l: "Avg Return", v: "+18.4%", pos: true }, { l: "Volatility", v: "11.2%" }, { l: "Sharpe",    v: "1.64",  pos: true  }, { l: "Freq.",     v: "41%" }, { l: "Avg Duration", v: "218d" }, { l: "Max DD",   v: "-4.1%" }],
  Bear:   [{ l: "Avg Return", v: "-22.1%", pos: false}, { l: "Volatility", v: "28.6%" }, { l: "Sharpe",    v: "-0.77", pos: false }, { l: "Freq.",     v: "18%" }, { l: "Avg Duration", v: "94d"  }, { l: "Max DD",   v: "-31.2%"}],
  Range:  [{ l: "Avg Return", v: "+3.1%",  pos: null }, { l: "Volatility", v: "14.3%" }, { l: "Sharpe",    v: "0.22",  pos: null  }, { l: "Freq.",     v: "28%" }, { l: "Avg Duration", v: "145d" }, { l: "Max DD",   v: "-9.8%" }],
  Stress: [{ l: "Avg Return", v: "-8.9%",  pos: false}, { l: "Volatility", v: "38.4%" }, { l: "Sharpe",    v: "-0.23", pos: false }, { l: "Freq.",     v: "13%" }, { l: "Avg Duration", v: "31d"  }, { l: "Max DD",   v: "-18.7%"}],
};

// Tiny sparkline for each regime — mock pattern
const REGIME_PATTERNS = {
  Bull:   [30,28,25,22,20,18,16,15,17,14,12,11,10,9,8],
  Bear:   [10,12,15,18,22,28,32,30,35,38,40,42,38,44,48],
  Range:  [20,22,19,21,20,23,21,20,22,21,19,22,20,21,20],
  Stress: [20,22,26,32,40,48,52,58,62,55,50,44,40,38,36],
};

function MiniChart({ pattern, color }) {
  const W = 200, H = 60;
  const min = Math.min(...pattern), max = Math.max(...pattern);
  const n = pattern.length;
  const px = i => (i / (n - 1)) * W;
  const py = v => H - 4 - ((v - min) / (max - min + 1)) * (H - 8);
  const points = pattern.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function RegimeCard({ name, active }) {
  const meta  = REGIME_META[name];
  const stats = REGIME_STATS[name];
  return (
    <div className="card" style={{ borderColor: active ? meta.color : undefined, borderWidth: active ? 1.5 : undefined }}>
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className={`regime-badge ${meta.cls}`} style={{ fontSize: 12, padding: "4px 10px" }}>{name}</div>
          {active && <span className="chip" style={{ background: "rgba(74,222,128,0.1)", color: "#16a34a", borderColor: "rgba(74,222,128,0.2)" }}>Active now</span>}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)" }}>{stats.find(s => s.l === "Freq.")?.v} of time</div>
      </div>

      <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6, marginBottom: 14 }}>{meta.desc}</p>

      {/* Mini chart */}
      <div style={{ background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 8, padding: "8px 10px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>VIX pattern (typical)</div>
        <MiniChart pattern={REGIME_PATTERNS[name]} color={meta.color} />
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {stats.map(s => (
          <div key={s.l} style={{ background: "var(--surface2)", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 3 }}>{s.l}</div>
            <div style={{
              fontSize: 14, fontWeight: 500,
              color: s.pos === true ? "#16a34a" : s.pos === false ? "#b91c1c" : "var(--text1)"
            }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Entry / exit signals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#16a34a", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Entry signals</div>
          {meta.entry.map((e, i) => (
            <div key={i} style={{ fontSize: 11, color: "var(--text2)", padding: "3px 0", borderBottom: "1px solid var(--border)", lineHeight: 1.5 }}>
              ↗ {e}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#f87171", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Exit signals</div>
          {meta.exit.map((e, i) => (
            <div key={i} style={{ fontSize: 11, color: "var(--text2)", padding: "3px 0", borderBottom: "1px solid var(--border)", lineHeight: 1.5 }}>
              ↘ {e}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Regimes() {
  const { data: dash } = useFetch(`${API}/dashboard`);
  const activeRegime = dash?.current_regime?.type || "Bull";
  const [filter, setFilter] = useState("All");

  const regimes = Object.keys(REGIME_META);
  const visible = filter === "All" ? regimes : [filter];

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text1)" }}>Regime Library</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Entry/exit signals, statistics and VIX patterns for each regime</div>
        </div>
        <div style={{ display: "flex", gap: 4, background: "var(--surface2)", borderRadius: 6, padding: 3, border: "1px solid var(--border)" }}>
          {["All", ...regimes].map(r => (
            <button key={r} onClick={() => setFilter(r)} style={{
              padding: "4px 12px", borderRadius: 4, fontSize: 11, border: "none",
              background: filter === r ? "var(--surface)" : "transparent",
              color: filter === r ? "var(--text1)" : "var(--text3)",
              fontWeight: filter === r ? 500 : 400,
              cursor: "pointer", boxShadow: filter === r ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: visible.length === 1 ? "1fr" : "1fr 1fr", gap: 16 }}>
        {visible.map(r => <RegimeCard key={r} name={r} active={r === activeRegime} />)}
      </div>
    </div>
  );
}
