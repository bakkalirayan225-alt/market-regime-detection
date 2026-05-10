// pages/Reports.jsx
import { useState } from "react";

const REPORTS = [
  { id: 1, title: "Weekly Regime Digest",     date: "Apr 19, 2026", desc: "Bull regime sustained for 3rd consecutive week. HMM confidence 87%. Volatility stable at 11.2%.", model: "HMM", type: "Weekly",    status: "ready" },
  { id: 2, title: "Model Performance Report", date: "Apr 15, 2026", desc: "HMM outperforms K-Means by 19pp and GMM by 11pp on silhouette score. Stability confirmed.", model: "HMM", type: "Monthly",   status: "ready" },
  { id: 3, title: "Regime Transition Log",    date: "Apr 10, 2026", desc: "2 transitions detected: Range→Bull (Apr 3), Bull confirmed (Apr 8). Avg transition duration: 3d.", model: "HMM", type: "Log",       status: "ready" },
  { id: 4, title: "Crisis Detection Report",  date: "Mar 31, 2026", desc: "No Stress regime events in Q1 2026. Bear exposure: 0 days. Max drawdown: -4.8%.", model: "HMM", type: "Quarterly", status: "ready" },
  { id: 5, title: "Backtest Summary Q1 2026", date: "Mar 31, 2026", desc: "Regime-aware strategy +18.4% vs buy-and-hold +14.1%. Outperformance +4.3pp. Sharpe 1.64.", model: "HMM", type: "Quarterly", status: "ready" },
];

const TYPE_STYLES = {
  Weekly:    { bg: "rgba(56,189,248,0.08)",  color: "#0ea5e9",  border: "rgba(56,189,248,0.2)"  },
  Monthly:   { bg: "rgba(96,165,250,0.08)",  color: "#3b82f6",  border: "rgba(96,165,250,0.2)"  },
  Quarterly: { bg: "rgba(192,132,252,0.08)", color: "#a855f7",  border: "rgba(192,132,252,0.2)" },
  Log:       { bg: "rgba(251,146,60,0.08)",  color: "#ea580c",  border: "rgba(251,146,60,0.2)"  },
};

function TypeBadge({ type }) {
  const c = TYPE_STYLES[type] || TYPE_STYLES.Log;
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 500, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {type}
    </span>
  );
}

function DownloadBtn({ fmt }) {
  const [clicked, setClicked] = useState(false);
  return (
    <button
      onClick={() => { setClicked(true); setTimeout(() => setClicked(false), 1500); }}
      style={{
        padding: "5px 12px", fontSize: 11, borderRadius: 5,
        border: `1px solid ${clicked ? "rgba(56,189,248,0.3)" : "var(--border)"}`,
        background: clicked ? "rgba(56,189,248,0.08)" : "var(--surface2)",
        color: clicked ? "var(--accent)" : "var(--text2)",
        cursor: "pointer", fontWeight: 500, transition: "all .2s",
        fontFamily: "var(--mono)",
      }}
    >
      {clicked ? "✓" : fmt}
    </button>
  );
}

export default function Reports() {
  const [filter,     setFilter]     = useState("All");
  const [genType,    setGenType]    = useState("Weekly");
  const [genRange,   setGenRange]   = useState("Last 30d");
  const [generating, setGenerating] = useState(false);
  const [generated,  setGenerated]  = useState(false);

  const types = ["All", "Weekly", "Monthly", "Quarterly", "Log"];
  const visible = filter === "All" ? REPORTS : REPORTS.filter(r => r.type === filter);

  function generate() {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1800);
  }

  return (
    <div className="page-content">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 16, alignItems: "start" }}>

        {/* Report list */}
        <div>
          <div style={{ display: "flex", gap: 3, marginBottom: 14, background: "var(--surface2)", borderRadius: 7, padding: 3, border: "1px solid var(--border)", width: "fit-content" }}>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: "4px 12px", borderRadius: 4, fontSize: 11, border: "none",
                background: filter === t ? "var(--b500)" : "transparent",
                color: filter === t ? "#fff" : "var(--text3)",
                fontWeight: filter === t ? 500 : 400,
                cursor: "pointer", fontFamily: "var(--font)", transition: "all .15s",
              }}>{t}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {visible.map(r => (
              <div key={r.id} className="card" style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text1)" }}>{r.title}</div>
                    <TypeBadge type={r.type} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0, marginLeft: 12, fontFamily: "var(--mono)" }}>{r.date}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6, marginBottom: 12 }}>{r.desc}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>Model:</div>
                    <span style={{
                      fontSize: 10, padding: "1px 6px", borderRadius: 3,
                      background: "rgba(56,189,248,0.08)", color: "var(--accent)",
                      fontFamily: "var(--mono)", fontWeight: 600, border: "1px solid rgba(56,189,248,0.15)",
                    }}>{r.model}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["PDF", "CSV", "JSON"].map(fmt => <DownloadBtn key={fmt} fmt={fmt} />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate panel */}
        <div className="card">
          <div className="card-header"><div className="card-title">Generate Report</div></div>

          {/* HMM badge */}
          <div style={{
            padding: "8px 10px", borderRadius: 7, marginBottom: 14,
            background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <div style={{ width: 18, height: 18, background: "var(--b500)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "var(--accent)", fontFamily: "var(--mono)", fontWeight: 600 }}>HM</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>Always uses <span style={{ color: "var(--accent)", fontWeight: 500 }}>HMM</span> — highest accuracy</div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="kpi-label" style={{ marginBottom: 6 }}>Report type</div>
            {["Weekly", "Monthly", "Quarterly", "Custom"].map(t => (
              <button key={t} onClick={() => setGenType(t)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 10px", borderRadius: 6, fontSize: 12, marginBottom: 3,
                border: `1px solid ${genType === t ? "rgba(56,189,248,0.3)" : "var(--border)"}`,
                background: genType === t ? "rgba(56,189,248,0.07)" : "var(--surface2)",
                color: genType === t ? "var(--accent)" : "var(--text2)",
                cursor: "pointer", fontWeight: genType === t ? 500 : 400,
                fontFamily: "var(--font)", transition: "all .15s",
              }}>{t}</button>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="kpi-label" style={{ marginBottom: 6 }}>Date range</div>
            {["Last 30d", "Last 90d", "YTD", "2020–2024"].map(d => (
              <button key={d} onClick={() => setGenRange(d)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 10px", borderRadius: 6, fontSize: 12, marginBottom: 3,
                border: `1px solid ${genRange === d ? "rgba(56,189,248,0.3)" : "var(--border)"}`,
                background: genRange === d ? "rgba(56,189,248,0.07)" : "var(--surface2)",
                color: genRange === d ? "var(--accent)" : "var(--text2)",
                cursor: "pointer", fontWeight: genRange === d ? 500 : 400,
                fontFamily: "var(--font)", transition: "all .15s",
              }}>{d}</button>
            ))}
          </div>

          {generated ? (
            <div style={{
              background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)",
              borderRadius: 8, padding: 14, marginBottom: 10, textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>✓ Report ready</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {["PDF", "CSV", "JSON"].map(fmt => <DownloadBtn key={fmt} fmt={fmt} />)}
              </div>
            </div>
          ) : (
            <button onClick={generate} disabled={generating} style={{
              width: "100%", padding: "10px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: generating ? "var(--surface2)" : "var(--b500)",
              border: generating ? "1px solid var(--border)" : "1px solid rgba(56,189,248,0.3)",
              color: generating ? "var(--text3)" : "#fff",
              cursor: generating ? "default" : "pointer",
              fontFamily: "var(--font)", transition: "all .2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {generating && <div className="spinner-sm" />}
              {generating ? "Generating…" : "Generate Report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
