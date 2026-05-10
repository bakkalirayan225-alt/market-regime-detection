// pages/Reports.jsx
import { useState } from "react";

const REPORTS = [
  {
    id: 1, title: "Weekly Regime Digest",     date: "Apr 19, 2026",
    desc: "Bull regime sustained for 3rd consecutive week. HMM confidence 87%. VIX stable.",
    model: "HMM", type: "Weekly", status: "ready",
  },
  {
    id: 2, title: "Model Performance Report", date: "Apr 15, 2026",
    desc: "HMM outperforms K-Means by 11pp silhouette score. GMM second at 82%.",
    model: "All", type: "Monthly", status: "ready",
  },
  {
    id: 3, title: "Regime Transition Log",    date: "Apr 10, 2026",
    desc: "2 transitions detected this month: Range→Bull (Apr 3), Bull confirmed (Apr 8).",
    model: "HMM", type: "Log", status: "ready",
  },
  {
    id: 4, title: "Crisis Detection Report",  date: "Mar 31, 2026",
    desc: "No Stress regime events in Q1 2026. Bear exposure: 0 days. Drawdown peak: -4.8%.",
    model: "HMM", type: "Quarterly", status: "ready",
  },
  {
    id: 5, title: "Backtest Summary Q1 2026", date: "Mar 31, 2026",
    desc: "Regime-aware strategy +18.4% vs buy-and-hold +14.1%. Outperformance +4.3pp.",
    model: "HMM", type: "Quarterly", status: "ready",
  },
];

const TYPE_COLORS = {
  Weekly:    { bg: "rgba(74,222,128,0.08)",   color: "#16a34a",  border: "rgba(74,222,128,0.2)"  },
  Monthly:   { bg: "rgba(96,165,250,0.08)",   color: "#2563eb",  border: "rgba(96,165,250,0.2)"  },
  Quarterly: { bg: "rgba(192,132,252,0.08)",  color: "#7c3aed",  border: "rgba(192,132,252,0.2)" },
  Log:       { bg: "rgba(251,146,60,0.08)",   color: "#c2410c",  border: "rgba(251,146,60,0.2)"  },
};

function TypeBadge({ type }) {
  const c = TYPE_COLORS[type] || TYPE_COLORS.Log;
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 500,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>{type}</span>
  );
}

function DownloadBtn({ fmt }) {
  const [clicked, setClicked] = useState(false);
  return (
    <button onClick={() => { setClicked(true); setTimeout(() => setClicked(false), 1500); }} style={{
      padding: "5px 12px", fontSize: 11, borderRadius: 5,
      border: "1px solid var(--border)", background: clicked ? "rgba(74,222,128,0.1)" : "var(--surface2)",
      color: clicked ? "#16a34a" : "var(--text2)", cursor: "pointer", fontWeight: 500,
      transition: "all .2s",
    }}>
      {clicked ? "✓" : fmt}
    </button>
  );
}

export default function Reports() {
  const [filter,   setFilter]   = useState("All");
  const [genModel, setGenModel] = useState("HMM");
  const [genType,  setGenType]  = useState("Weekly");
  const [genRange, setGenRange] = useState("2020–2024");
  const [generating, setGenerating] = useState(false);
  const [generated,  setGenerated]  = useState(false);

  const types = ["All", "Weekly", "Monthly", "Quarterly", "Log"];
  const visible = filter === "All" ? REPORTS : REPORTS.filter(r => r.type === filter);

  function generate() {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1800);
  }

  return (
    <div className="page-content">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>

        {/* Report list */}
        <div>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 4, marginBottom: 14, background: "var(--surface2)", borderRadius: 6, padding: 3, border: "1px solid var(--border)", width: "fit-content" }}>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: "4px 12px", borderRadius: 4, fontSize: 11, border: "none",
                background: filter === t ? "var(--surface)" : "transparent",
                color: filter === t ? "var(--text1)" : "var(--text3)",
                fontWeight: filter === t ? 500 : 400, cursor: "pointer",
                boxShadow: filter === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}>{t}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visible.map(r => (
              <div key={r.id} className="card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text1)" }}>{r.title}</div>
                    <TypeBadge type={r.type} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0, marginLeft: 12 }}>{r.date}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6, marginBottom: 12 }}>{r.desc}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Model: <span style={{ color: "var(--g500)", fontWeight: 500 }}>{r.model}</span></div>
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

          <div style={{ marginBottom: 12 }}>
            <div className="kpi-label" style={{ marginBottom: 6 }}>Report type</div>
            {["Weekly", "Monthly", "Quarterly", "Custom"].map(t => (
              <button key={t} onClick={() => setGenType(t)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 10px", borderRadius: 6, fontSize: 12, marginBottom: 4,
                border: `1px solid ${genType === t ? "var(--g500)" : "var(--border)"}`,
                background: genType === t ? "rgba(59,138,80,0.08)" : "var(--surface2)",
                color: genType === t ? "var(--g500)" : "var(--text2)",
                cursor: "pointer", fontWeight: genType === t ? 500 : 400,
              }}>{t}</button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="kpi-label" style={{ marginBottom: 6 }}>Model</div>
            {["K-Means", "GMM", "HMM", "All"].map(m => (
              <button key={m} onClick={() => setGenModel(m)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 10px", borderRadius: 6, fontSize: 12, marginBottom: 4,
                border: `1px solid ${genModel === m ? "var(--g500)" : "var(--border)"}`,
                background: genModel === m ? "rgba(59,138,80,0.08)" : "var(--surface2)",
                color: genModel === m ? "var(--g500)" : "var(--text2)",
                cursor: "pointer", fontWeight: genModel === m ? 500 : 400,
              }}>{m}</button>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="kpi-label" style={{ marginBottom: 6 }}>Date range</div>
            {["Last 30d", "Last 90d", "YTD", "2020–2024"].map(d => (
              <button key={d} onClick={() => setGenRange(d)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 10px", borderRadius: 6, fontSize: 12, marginBottom: 4,
                border: `1px solid ${genRange === d ? "var(--g500)" : "var(--border)"}`,
                background: genRange === d ? "rgba(59,138,80,0.08)" : "var(--surface2)",
                color: genRange === d ? "var(--g500)" : "var(--text2)",
                cursor: "pointer", fontWeight: genRange === d ? 500 : 400,
              }}>{d}</button>
            ))}
          </div>

          {generated ? (
            <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 8, padding: 14, marginBottom: 12, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 500, marginBottom: 4 }}>✓ Report ready</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {["PDF", "CSV", "JSON"].map(fmt => <DownloadBtn key={fmt} fmt={fmt} />)}
              </div>
            </div>
          ) : (
            <button onClick={generate} disabled={generating} style={{
              width: "100%", padding: "10px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: generating ? "var(--surface2)" : "var(--g600)",
              border: "none", color: generating ? "var(--text3)" : "#fff", cursor: generating ? "default" : "pointer",
            }}>
              {generating ? "Generating…" : "Generate Report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
