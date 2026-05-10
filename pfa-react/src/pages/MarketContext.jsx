// src/context/MarketContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const MarketContext = createContext(null);

const MARKET_MAP = {
  NA:   [{ id: "SP500",        label: "S&P 500"      },
         { id: "Nasdaq",       label: "Nasdaq 100"   }],
  EU:   [{ id: "EuroStoxx50",  label: "Euro Stoxx 50"},
         { id: "FTSE100",      label: "FTSE 100"     }],
  Asia: [{ id: "Nikkei225",    label: "Nikkei 225"   },
         { id: "HangSeng",     label: "Hang Seng"    }],
};

export function MarketProvider({ children }) {
  const [region,    setRegionState]    = useState("NA");
  const [market,    setMarketState]    = useState("SP500");
  const [timeframe, setTimeframe]      = useState("year");

  const setRegion = useCallback((r) => {
    setRegionState(r);
    setMarketState(MARKET_MAP[r][0].id);
  }, []);

  const setMarket = useCallback((m) => setMarketState(m), []);

  const markets = MARKET_MAP[region] || [];

  return (
    <MarketContext.Provider value={{ region, market, timeframe, markets, setRegion, setMarket, setTimeframe, MARKET_MAP }}>
      {children}
    </MarketContext.Provider>
  );
}

export const useMarket = () => useContext(MarketContext);
