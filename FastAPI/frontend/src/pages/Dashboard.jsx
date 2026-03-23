import React, { useState, useCallback } from "react";
import useSWR from "swr";
import { Search, RefreshCcw, TrendingUp, TrendingDown, Minus, Zap, ZapOff } from "lucide-react";
import { BASE } from "../utils/api";

const fetcher = (url) => fetch(url).then((res) => res.json());

const REFRESH_OPTIONS = [
  { label: "Off",  value: 0 },
  { label: "15s",  value: 15000 },
  { label: "30s",  value: 30000 },
  { label: "60s",  value: 60000 },
];

const Dashboard = ({ setSelectedData, navigateTo }) => {
  const [searchTerm, setSearchTerm]     = useState("");
  const [filterSignal, setFilterSignal] = useState("ALL");
  const [minConf, setMinConf]           = useState(0);
  const [refreshIdx, setRefreshIdx]     = useState(1); // default 15s
  const [lastUpdated, setLastUpdated]   = useState(null);

  const refreshInterval = REFRESH_OPTIONS[refreshIdx].value;

  const { data: signals, error, mutate, isLoading } = useSWR(
    `${BASE}/api/signals/all`, fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      onSuccess: () => setLastUpdated(new Date().toLocaleTimeString()),
    }
  );

  const handleRefresh = useCallback(() => { mutate(); }, [mutate]);

  const handleCardClick = (stock) => {
    setSelectedData(stock);
    navigateTo("predictions");
  };

  const filteredSignals = signals?.filter(s => {
    if (s.signal === "ERROR") return false;
    const matchSearch  = s.ticker?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter  = filterSignal === "ALL" || s.signal === filterSignal;
    const matchConf    = (s.confidence_pct ?? 0) >= minConf;
    return matchSearch && matchFilter && matchConf;
  });

  const getSignalStyle = (signal) => ({
    color: signal === "BUY" ? "var(--signal-buy)" : signal === "SELL" ? "var(--signal-sell)" : "var(--signal-hold)",
    fontWeight: "bold",
    fontSize: "1.1rem",
  });

  const getTrendIcon = (trend) => {
    if (trend === "↑") return <TrendingUp size={16} color="var(--signal-buy)" />;
    if (trend === "↓") return <TrendingDown size={16} color="var(--signal-sell)" />;
    return <Minus size={16} color="var(--signal-hold)" />;
  };

  const cycleStat = () => setRefreshIdx(i => (i + 1) % REFRESH_OPTIONS.length);

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Live Market Signals</h2>
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            {lastUpdated ? `Last updated: ${lastUpdated}` : "Waiting for first load…"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Auto-refresh toggle */}
          <button
            className="btn"
            onClick={cycleStat}
            style={{ background: refreshInterval > 0 ? "var(--accent-blue)" : "var(--bg-card)", color: refreshInterval > 0 ? "white" : "var(--text-muted)" }}
            title="Toggle auto-refresh interval"
          >
            {refreshInterval > 0 ? <Zap size={14} /> : <ZapOff size={14} />}
            {REFRESH_OPTIONS[refreshIdx].label}
          </button>
          <button className="btn" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCcw size={14} style={{ animation: isLoading ? "spin 1s linear infinite" : "none" }} />
            {isLoading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flexGrow: 1, minWidth: "200px", maxWidth: "360px" }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search symbols…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px 10px 10px 32px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 4, color: "var(--text-main)", outline: "none" }}
          />
        </div>
        <select
          value={filterSignal}
          onChange={e => setFilterSignal(e.target.value)}
          style={{ padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 4, outline: "none", color: "var(--text-main)" }}
        >
          <option value="ALL">All Signals</option>
          <option value="BUY">BUY Only</option>
          <option value="SELL">SELL Only</option>
          <option value="HOLD">HOLD Only</option>
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <span>Min Conf:</span>
          <input
            type="range" min={0} max={90} step={5} value={minConf}
            onChange={e => setMinConf(Number(e.target.value))}
            style={{ width: 100, accentColor: "var(--accent-blue)" }}
          />
          <span style={{ minWidth: 35, color: "var(--text-main)", fontWeight: 600 }}>{minConf}%</span>
        </div>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="grid-container">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card skeleton" style={{ height: 185 }} />)}
        </div>
      )}

      {error && (
        <div style={{ color: "var(--signal-sell)", padding: "20px", textAlign: "center" }}>
          ⚠️ Failed to load signals. Ensure the backend is running at port 8000.
        </div>
      )}

      {!isLoading && !error && filteredSignals?.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
          No signals match the current filters.
        </div>
      )}

      {/* Signal Cards */}
      <div className="grid-container">
        {filteredSignals?.map(stock => (
          <div
            key={stock.ticker}
            className="card"
            onClick={() => handleCardClick(stock)}
            style={{ cursor: "pointer", borderTop: `3px solid ${stock.signal === "BUY" ? "var(--signal-buy)" : stock.signal === "SELL" ? "var(--signal-sell)" : "var(--signal-hold)"}` }}
            title={`Click for detailed analysis of ${stock.ticker}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>{stock.ticker}</h3>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{stock.yf_symbol}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {getTrendIcon(stock.trend)}
                <span style={getSignalStyle(stock.signal)}>{stock.confidence || stock.signal}</span>
              </div>
            </div>

            <div style={{ marginBottom: 12, fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Price: </span>
              <strong style={{ color: "var(--text-main)" }}>₹{stock.price?.toFixed(2) || "—"}</strong>
            </div>

            {/* Probability bar */}
            <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
              <div style={{ background: "var(--signal-buy)",  width: `${(stock.probabilities?.BUY  || 0) * 100}%`, transition: "width 0.5s" }} />
              <div style={{ background: "var(--signal-hold)", width: `${(stock.probabilities?.HOLD || 0) * 100}%`, transition: "width 0.5s" }} />
              <div style={{ background: "var(--signal-sell)", width: `${(stock.probabilities?.SELL || 0) * 100}%`, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.73rem", color: "var(--text-muted)" }}>
              <span>B:{((stock.probabilities?.BUY  || 0) * 100).toFixed(0)}%</span>
              <span>H:{((stock.probabilities?.HOLD || 0) * 100).toFixed(0)}%</span>
              <span>S:{((stock.probabilities?.SELL || 0) * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;