// pages/Regimes.jsx
import { useState } from "react";

const REGIME_META = {
  Bull: {
    cls: "bull", color: "#38bdf8", bg: "rgba(56,189,248,0.07)", border: "rgba(56,189,248,0.2)",
    desc: "Sustained positive returns, low volatility, risk-on sentiment. Credit spreads tight. Momentum positive.",
    entry: ["Returns > 0 for 20+ days", "Volatility below avg", "Drawdown < 5%"],
    exit:  ["Volatility spikes sharply", "Returns negative 3 consecutive days", "Drawdown > 8%"],
  },
  Bear: {
    cls: "bear", color: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.2)",
    desc: "Sustained negative returns, elevated volatility, risk-off sentiment. Credit spreads widening.",
    entry: ["Returns < 0 for 10+ days", "High realized volatility", "Drawdown > 10%"],
    exit:  ["Volatility normalizes", "Returns stabilize above 0", "Drawdown recovery > 5%"],
  },
  Range: {
    cls: "range", color: "#fb923c", bg: "rgba(251,146,60,0.07)", border: "rgba(251,146,60,0.2)",
    desc: "Directionless price action, moderate volatility. Typical transition period between trending regimes.",
    entry: ["Returns flat ±1% for 15+ days", "Moderate realized vol", "No clear trend direction"],
    exit:  ["Breakout above resistance", "Volatility moves outside avg band", "Return momentum > 1.5%"],
  },
  Stress: {
    cls: "stress", color: "#c084fc", bg: "rgba(192,132,252,0.07)", border: "rgba(192,132,252,0.2)",
    desc: "Crisis conditions. Extreme volatility, panic selling, systemic risk events. Rare but severe.",
    entry: ["Volatility extreme spike", "Drawdown > 15%", "Intraday swings > 3%"],
    exit:  ["Vol normalizes for 5+ days", "Policy intervention signals", "Returns stabilize"],
  },
};

const REGIME_STATS = {
  Bull:   [{ l: "Avg Return", v: "+18.4%", pos: true  }, { l: "Volatility", v: "11.2%" }, { l: "Sharpe", v: "1.64",  pos: true  }, { l: "Freq.",  v: "41%"  }, { l: "Avg Duration", v: "218d" }, { l: "Max DD", v: "-4.1%"  }],
  Bear:   [{ l: "Avg Return", v: "-22.1%", pos: false }, { l: "Volatility", v: "28.6%" }, { l: "Sharpe", v: "-0.77", pos: false }, { l: "Freq.",  v: "18%"  }, { l: "Avg Duration", v: "94d"  }, { l: "Max DD", v: "-31.2%" }],
  Range:  [{ l: "Avg Return", v: "+3.1%",  pos: null  }, { l: "Volatility", v: "14.3%" }, { l: "Sharpe", v: "0.22",  pos: null  }, { l: "Freq.",  v: "28%"  }, { l: "Avg Duration", v: "145d" }, { l: "Max DD", v: "-9.8%"  }],
  Stress: [{ l: "Avg Return", v: "-8.9%",  pos: false }, { l: "Volatility", v: "38.4%" }, { l: "Sharpe", v: "-0.23", pos: false }, { l: "Freq.",  v: "13%"  }, { l: "Avg Duration", v: "31d"  }, { l: "Max DD", v: "-18.7%" }],
};

// Volatility sparkline patterns (not VIX – just stylized vol proxy)
const VOL_PATTERNS = {
  Bull:   [18, 16, 15, 14, 13, 12, 14, 11, 10, 11, 10, 9,  11, 10, 9 ],
  Bear:   [22, 26, 32, 38, 44, 52, 48, 55, 60, 52, 48, 44, 42, 40, 38],
  Range:  [22, 24, 20, 23, 21, 25, 22, 21, 23, 22, 20, 24, 21, 23, 21],
  Stress: [28, 36, 46, 58, 68, 75, 80, 72, 65, 58, 50, 44, 40, 38, 35],
};

function MiniChart({ pattern, color }) {
  const W = 200, H = 60;
  const min = Math.min(...pattern), max = Math.max(...pattern);
  const n = pattern.length;
  const px = i => (i / (n - 1)) * W;
  const py = v => H - 4 - ((v - min) / (max - min + 1)) * (H - 8);
  const points = pattern.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  // Area fill
  const area = `${px(0)},${H} ` + points + ` ${px(n - 1)},${H}`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace("#", "")})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function RegimeCard({ name, active }) {
  const meta  = REGIME_META[name];
  const stats = REGIME_STATS[name];
  return (
    <div className="card" style={{ borderColor: active ? meta.color : undefined }}>
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className={`regime-badge ${meta.cls}`} style={{ fontSize: 12, padding: "4px 10px" }}>{name}</div>
          {active && (
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 4,
              background: "rgba(56,189,248,0.08)", color: "var(--accent)",
              border: "1px solid rgba(56,189,248,0.2)", fontWeight: 500,
            }}>Active now</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)" }}>
          {stats.find(s => s.l === "Freq.")?.v} of time
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.65, marginBottom: 14 }}>{meta.desc}</p>

      {/* Volatility sparkline */}
      <div style={{ background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 8, padding: "8px 10px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>Realized volatility (typical)</div>
        <MiniChart pattern={VOL_PATTERNS[name]} color={meta.color} />
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {stats.map(s => (
          <div key={s.l} style={{ background: "var(--surface2)", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 3 }}>{s.l}</div>
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: s.pos === true ? "var(--bull)" : s.pos === false ? "var(--bear)" : "var(--text1)",
              fontFamily: "var(--mono)",
            }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Entry / exit signals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { title: "Entry signals", color: "var(--bull)", icon: "↗", items: meta.entry },
          { title: "Exit signals",  color: "var(--bear)", icon: "↘", items: meta.exit  },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontSize: 10, fontWeight: 600, color: col.color, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
              {col.title}
            </div>
            {col.items.map((e, i) => (
              <div key={i} style={{ fontSize: 11, color: "var(--text2)", padding: "4px 0", borderBottom: "1px solid var(--border)", lineHeight: 1.5 }}>
                <span style={{ color: col.color, marginRight: 4 }}>{col.icon}</span>{e}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Regimes() {
  const [filter, setFilter] = useState("All");
  const activeRegime = "Bull"; // In real app, comes from context/API

  const regimes = Object.keys(REGIME_META);
  const visible = filter === "All" ? regimes : [filter];

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text1)" }}>Regime Library</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Entry/exit signals, statistics and volatility patterns for each regime</div>
        </div>
        <div style={{ display: "flex", gap: 3, background: "var(--surface2)", borderRadius: 7, padding: 3, border: "1px solid var(--border)" }}>
          {["All", ...regimes].map(r => (
            <button key={r} onClick={() => setFilter(r)} style={{
              padding: "4px 12px", borderRadius: 4, fontSize: 11, border: "none",
              background: filter === r ? "var(--b500)" : "transparent",
              color: filter === r ? "#fff" : "var(--text3)",
              fontWeight: filter === r ? 500 : 400,
              cursor: "pointer", fontFamily: "var(--font)",
              transition: "all .15s",
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
