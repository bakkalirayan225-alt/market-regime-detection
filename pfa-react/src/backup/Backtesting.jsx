// pages/Backtesting.jsx
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

// Generate fake equity curves from mock data
function buildEquityCurves(n = 60) {
  const bh = [100], strat = [100];
  for (let i = 1; i < n; i++) {
    const daily = (Math.random() - 0.45) * 2.2;
    bh.push(+(bh[i - 1] * (1 + daily / 100)).toFixed(2));
    // Strategy avoids Bear/Stress periods (roughly every 15–20 bars)
    const inBadRegime = (i >= 14 && i <= 22) || (i >= 38 && i <= 44);
    const stratDaily = inBadRegime ? daily * 0.1 : daily * 1.05;
    strat.push(+(strat[i - 1] * (1 + stratDaily / 100)).toFixed(2));
  }
  return { bh, strat };
}

function EquityChart({ bh, strat }) {
  const W = 600, H = 180;
  const all = [...bh, ...strat];
  const min = Math.min(...all) - 1, max = Math.max(...all) + 1;
  const n = bh.length;
  const px = i => (i / (n - 1)) * W;
  const py = v => H - 4 - ((v - min) / (max - min)) * (H - 8);
  const bhPts   = bh.map((v, i)   => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const stratPts = strat.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const zeroY = py(100);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="var(--border2)" strokeWidth="0.5" strokeDasharray="4 3" />
      <polyline points={bhPts}   fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="5 3" />
      <polyline points={stratPts} fill="none" stroke="#4ade80" strokeWidth="2"   strokeLinejoin="round" />
    </svg>
  );
}

const REGIME_PERF = [
  { regime: "Bull",   ret: "+18.4%", trades: 12, winRate: "83%",  avgHold: "18d", contribution: "+14.2%" },
  { regime: "Bear",   ret: "+4.1%",  trades: 6,  winRate: "67%",  avgHold: "7d",  contribution: "+2.8%"  },
  { regime: "Range",  ret: "+1.2%",  trades: 9,  winRate: "56%",  avgHold: "12d", contribution: "+1.1%"  },
  { regime: "Stress", ret: "+2.8%",  trades: 3,  winRate: "100%", avgHold: "3d",  contribution: "+0.9%"  },
];

export default function Backtesting() {
  const { data: models } = useFetch(`${API}/models`);
  const [model,     setModel]     = useState("HMM");
  const [dateRange, setDateRange] = useState("2020–2024");
  const [strategy,  setStrategy]  = useState("regime-aware");
  const [ran,       setRan]       = useState(false);
  const [curves,    setCurves]    = useState(null);

  useEffect(() => {
    if (models) setModel(models.best_model);
  }, [models]);

  function runBacktest() {
    setCurves(buildEquityCurves(60));
    setRan(true);
  }

  const bhFinal    = curves ? curves.bh[curves.bh.length - 1]     : null;
  const stratFinal = curves ? curves.strat[curves.strat.length - 1] : null;

  return (
    <div className="page-content">
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, alignItems: "start" }}>

        {/* Config panel */}
        <div className="card">
          <div className="card-header"><div className="card-title">Configuration</div></div>

          <div style={{ marginBottom: 14 }}>
            <div className="kpi-label" style={{ marginBottom: 6 }}>Model</div>
            <div style={{ display: "flex", gap: 4, flexDirection: "column" }}>
              {["K-Means", "GMM", "HMM"].map(m => (
                <button key={m} onClick={() => setModel(m)} style={{
                  padding: "7px 10px", borderRadius: 6, fontSize: 12, textAlign: "left",
                  border: `1px solid ${model === m ? "var(--g500)" : "var(--border)"}`,
                  background: model === m ? "rgba(59,138,80,0.08)" : "var(--surface2)",
                  color: model === m ? "var(--g500)" : "var(--text2)",
                  cursor: "pointer", fontWeight: model === m ? 500 : 400,
                }}>
                  {m} {models?.best_model === m && "★"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="kpi-label" style={{ marginBottom: 6 }}>Date range</div>
            {["2015–2019", "2018–2022", "2020–2024", "All available"].map(d => (
              <button key={d} onClick={() => setDateRange(d)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 10px", borderRadius: 6, fontSize: 12, marginBottom: 4,
                border: `1px solid ${dateRange === d ? "var(--g500)" : "var(--border)"}`,
                background: dateRange === d ? "rgba(59,138,80,0.08)" : "var(--surface2)",
                color: dateRange === d ? "var(--g500)" : "var(--text2)",
                cursor: "pointer", fontWeight: dateRange === d ? 500 : 400,
              }}>{d}</button>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="kpi-label" style={{ marginBottom: 6 }}>Strategy</div>
            {[
              { id: "regime-aware", label: "Regime-aware",   desc: "Cash during Bear/Stress"    },
              { id: "long-only",    label: "Long only",       desc: "Always invested"             },
              { id: "short-bear",   label: "Short on Bear",   desc: "Short during Bear regime"    },
            ].map(s => (
              <button key={s.id} onClick={() => setStrategy(s.id)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 10px", borderRadius: 6, fontSize: 12, marginBottom: 4,
                border: `1px solid ${strategy === s.id ? "var(--g500)" : "var(--border)"}`,
                background: strategy === s.id ? "rgba(59,138,80,0.08)" : "var(--surface2)",
                color: strategy === s.id ? "var(--g500)" : "var(--text2)",
                cursor: "pointer",
              }}>
                <div style={{ fontWeight: strategy === s.id ? 500 : 400 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{s.desc}</div>
              </button>
            ))}
          </div>

          <button onClick={runBacktest} style={{
            width: "100%", padding: "10px", borderRadius: 7, fontSize: 13, fontWeight: 600,
            background: "var(--g600)", border: "none", color: "#fff", cursor: "pointer",
          }}>
            Run Backtest
          </button>
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!ran ? (
            <div className="card" style={{ textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 6 }}>Configure and run a backtest to see results</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>Using {model} model · {dateRange}</div>
            </div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[
                  { label: "Strategy Return",   value: `+${(stratFinal - 100).toFixed(1)}%`, pos: true  },
                  { label: "Buy & Hold Return", value: `+${(bhFinal - 100).toFixed(1)}%`,    pos: null  },
                  { label: "Outperformance",    value: `+${(stratFinal - bhFinal).toFixed(1)}%`, pos: true },
                  { label: "Max Drawdown",      value: "-6.2%",                               pos: false },
                ].map(k => (
                  <div key={k.label} className="kpi-card">
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{
                      color: k.pos === true ? "#16a34a" : k.pos === false ? "#b91c1c" : "var(--text1)"
                    }}>{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Equity curve */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Equity Curves — {dateRange}</div>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div className="legend-item"><div className="legend-dot" style={{ background: "#4ade80" }} />Regime strategy</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: "#94a3b8" }} />Buy &amp; hold</div>
                  </div>
                </div>
                <EquityChart bh={curves.bh} strat={curves.strat} />
              </div>

              {/* Per-regime breakdown */}
              <div className="card">
                <div className="card-header"><div className="card-title">Performance by Regime</div></div>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Regime</th><th>Return</th><th>Trades</th>
                      <th>Win Rate</th><th>Avg Hold</th><th>Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REGIME_PERF.map(r => (
                      <tr key={r.regime}>
                        <td><div className={`regime-badge ${r.regime.toLowerCase()}`}>{r.regime}</div></td>
                        <td style={{ color: r.ret.startsWith("+") ? "#16a34a" : "#b91c1c", fontWeight: 500 }}>{r.ret}</td>
                        <td>{r.trades}</td>
                        <td>{r.winRate}</td>
                        <td>{r.avgHold}</td>
                        <td style={{ color: "#16a34a", fontWeight: 500 }}>{r.contribution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
