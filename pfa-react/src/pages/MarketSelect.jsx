// pages/MarketSelect.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarket } from "./MarketContext";

const FLAG_URLS = {
  NA:   "https://flagcdn.com/w2560/us.png",
  EU:   "https://flagcdn.com/w2560/eu.png",
  Asia: "https://flagcdn.com/w2560/jp.png",
};

const REGIONS = [
  {
    id: "NA",
    label: "North America",
    sub: "United States",
    markets: [
      { id: "SP500",  label: "S&P 500"    },
      { id: "Nasdaq", label: "Nasdaq 100" },
    ],
    accentColor: "#B22234",
  },
  {
    id: "EU",
    label: "Europe",
    sub: "European Union",
    markets: [
      { id: "EuroStoxx50", label: "Euro Stoxx 50" },
      { id: "FTSE100",     label: "FTSE 100"      },
    ],
    accentColor: "#FFCC00",
  },
  {
    id: "Asia",
    label: "Asia Pacific",
    sub: "Japan · Hong Kong",
    markets: [
      { id: "Nikkei225", label: "Nikkei 225" },
      { id: "HangSeng",  label: "Hang Seng"  },
    ],
    accentColor: "#BC002D",
  },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ms-page {
    position: fixed;
    inset: 0;
    overflow: hidden;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    color: #e2edfa;
  }

  .ms-flag-layer {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    transition: opacity 0.75s ease;
  }

  .ms-overlay {
    position: absolute;
    inset: 0;
    transition: background 0.75s ease;
  }

  .ms-content {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 0;
  }

  .ms-badge {
    font-size: 10px;
    letter-spacing: 3px;
    color: #38bdf8;
    text-transform: uppercase;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ms-badge::before, .ms-badge::after {
    content: '';
    width: 30px;
    height: 1px;
    background: rgba(56,189,248,0.4);
  }

  .ms-title {
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -1px;
    margin-bottom: 8px;
    text-align: center;
  }

  .ms-sub {
    font-size: 14px;
    color: #7ea8cc;
    margin-bottom: 44px;
    text-align: center;
  }

  .ms-cards {
    display: flex;
    gap: 20px;
    margin-bottom: 36px;
  }

  .ms-card {
    width: 210px;
    border-radius: 18px;
    padding: 0;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
    overflow: hidden;
    backdrop-filter: blur(16px);
    border: 2px solid rgba(56,189,248,0.12);
    background: rgba(10,20,40,0.72);
  }
  .ms-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    border-color: rgba(56,189,248,0.3);
  }
  .ms-card.selected {
    border-color: #38bdf8;
    background: rgba(56,189,248,0.10);
    box-shadow: 0 0 40px rgba(56,189,248,0.2), 0 16px 48px rgba(0,0,0,0.4);
    transform: translateY(-6px);
  }

  .ms-flag-thumb {
    width: 100%;
    height: 90px;
    object-fit: cover;
    display: block;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .ms-card-body {
    padding: 18px 20px 20px;
  }

  .ms-card-label {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 3px;
  }
  .ms-card-sub {
    font-size: 11px;
    color: #7ea8cc;
    margin-bottom: 12px;
  }
  .ms-card-markets {
    font-size: 11px;
    color: #3d6080;
    letter-spacing: 0.3px;
  }
  .ms-card-selected-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    font-size: 11px;
    color: #38bdf8;
    font-weight: 500;
  }
  .ms-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #38bdf8;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .ms-market-row {
    display: flex;
    align-items: center;
    gap: 10px;
    animation: fadeSlideUp 0.3s ease both;
    margin-bottom: 28px;
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ms-market-label {
    font-size: 12px;
    color: #7ea8cc;
    margin-right: 4px;
    white-space: nowrap;
  }

  .ms-market-btn {
    padding: 10px 22px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'Space Grotesk', system-ui;
    transition: all 0.2s ease;
    border: 2px solid rgba(56,189,248,0.2);
    background: rgba(10,20,40,0.8);
    color: #e2edfa;
    backdrop-filter: blur(8px);
  }
  .ms-market-btn:hover {
    border-color: rgba(56,189,248,0.5);
    background: rgba(56,189,248,0.07);
  }
  .ms-market-btn.active {
    border-color: #38bdf8;
    background: rgba(56,189,248,0.15);
    color: #38bdf8;
    box-shadow: 0 0 16px rgba(56,189,248,0.2);
  }

  .ms-confirm-btn {
    padding: 15px 52px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #38bdf8 0%, #2d6cbc 100%);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Space Grotesk', system-ui;
    letter-spacing: 0.4px;
    box-shadow: 0 0 48px rgba(56,189,248,0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    animation: fadeSlideUp 0.35s ease both;
  }
  .ms-confirm-btn:hover {
    transform: scale(1.04);
    box-shadow: 0 0 60px rgba(56,189,248,0.45);
  }

  .ms-step-hint {
    margin-top: 28px;
    font-size: 11px;
    color: #3d6080;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-align: center;
  }
`;

export default function MarketSelect() {
  const [hovered,   setHovered]   = useState(null);
  const [selRegion, setSelRegion] = useState(null);
  const [selMarket, setSelMarket] = useState(null);
  const { setRegion, setMarket }  = useMarket();
  const navigate                  = useNavigate();

  const activeBg = hovered ?? selRegion;

  const handleRegionClick = (id) => {
    setSelRegion(id);
    setSelMarket(null);
  };

  const handleConfirm = () => {
    setRegion(selRegion);
    setMarket(selMarket);
    navigate("/dashboard");
  };

  const activeRegion = REGIONS.find(r => r.id === selRegion);

  return (
    <>
      <style>{STYLES}</style>

      <div className="ms-page">
        {/* Flag background layers — one per region, faded in/out via opacity */}
        {REGIONS.map(r => (
          <div
            key={r.id}
            className="ms-flag-layer"
            style={{
              backgroundImage: `url(${FLAG_URLS[r.id]})`,
              opacity: activeBg === r.id ? 1 : 0,
            }}
          />
        ))}

        {/* Dark overlay — lightens slightly on hover to reveal the flag */}
        <div
          className="ms-overlay"
          style={{
            background: activeBg
              ? "rgba(6,13,28,0.68)"
              : "rgba(6,13,28,0.96)",
          }}
        />

        <div className="ms-content">
          {/* Header */}
          <div className="ms-badge">Market Regime Dashboard</div>
          <h1 className="ms-title">Choose Your Market</h1>
          <p className="ms-sub">Hover to preview a region · Click to select</p>

          {/* Region cards */}
          <div className="ms-cards">
            {REGIONS.map(r => (
              <div
                key={r.id}
                className={`ms-card${selRegion === r.id ? " selected" : ""}`}
                onMouseEnter={() => setHovered(r.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleRegionClick(r.id)}
              >
                <img
                  src={FLAG_URLS[r.id]}
                  alt={r.label}
                  className="ms-flag-thumb"
                  draggable={false}
                />
                <div className="ms-card-body">
                  <div className="ms-card-label">{r.label}</div>
                  <div className="ms-card-sub">{r.sub}</div>
                  <div className="ms-card-markets">
                    {r.markets.map(m => m.label).join("  ·  ")}
                  </div>
                  {selRegion === r.id && (
                    <div className="ms-card-selected-tag">
                      <div className="ms-dot" />
                      Selected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Market picker — appears after region selected */}
          {activeRegion && (
            <div className="ms-market-row" key={selRegion}>
              <span className="ms-market-label">Index</span>
              {activeRegion.markets.map(m => (
                <button
                  key={m.id}
                  className={`ms-market-btn${selMarket === m.id ? " active" : ""}`}
                  onClick={() => setSelMarket(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Confirm — appears after both selected */}
          {selRegion && selMarket && (
            <button className="ms-confirm-btn" onClick={handleConfirm}>
              Enter Dashboard →
            </button>
          )}

          {/* Step hint */}
          {!selRegion && (
            <p className="ms-step-hint">Step 1 of 2 — Select a region</p>
          )}
          {selRegion && !selMarket && (
            <p className="ms-step-hint">Step 2 of 2 — Select an index</p>
          )}
        </div>
      </div>
    </>
  );
}
