import React, { useState } from "react";
import useSWR from "swr";
import { BASE } from "../utils/api";
import { RefreshCcw } from "lucide-react";

const fetcher = url => fetch(url).then(r => r.json());

const SIGNAL_BADGE = {
  BUY:  { bg: "rgba(0,184,148,0.18)",  color: "var(--signal-buy)" },
  SELL: { bg: "rgba(255,82,82,0.18)",   color: "var(--signal-sell)" },
  HOLD: { bg: "rgba(241,196,15,0.15)",  color: "var(--signal-hold)" },
};

const History = () => {
  const [selectedTicker, setSelectedTicker] = useState("ALL");

  const { data: watchlist } = useSWR(`${BASE}/api/watchlist`, fetcher);

  const url = selectedTicker === "ALL"
    ? `${BASE}/api/history?limit_per_ticker=10`
    : `${BASE}/api/history/${selectedTicker}?limit=80`;

  const { data: history, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
  });

  const badge = (sig) => {
    const s = SIGNAL_BADGE[sig] || SIGNAL_BADGE.HOLD;
    return (
      <span style={{
        padding: "2px 10px", borderRadius: 4, fontSize: "0.8rem", fontWeight: 700,
        background: s.bg, color: s.color,
      }}>
        {sig}
      </span>
    );
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h2>Signal History</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={selectedTicker}
            onChange={e => setSelectedTicker(e.target.value)}
            style={{ padding: "9px 12px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 4, color: "var(--text-main)", outline: "none" }}
          >
            <option value="ALL">All Tickers</option>
            {watchlist?.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker}</option>)}
          </select>
          <button className="btn" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 6 }} />)}
        </div>
      )}

      {!isLoading && (!history || history.length === 0) && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <p style={{ marginBottom: 10 }}>No signal history yet.</p>
          <p style={{ fontSize: "0.9rem" }}>History populates automatically every time the alert engine runs (every 5 minutes).</p>
        </div>
      )}

      {!isLoading && history?.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-dark)", borderBottom: "1px solid var(--border-color)" }}>
                  {["Timestamp","Ticker","Signal","Price","Confidence","BUY%","SELL%","Trend"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-muted)", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid var(--border-color)", background: i % 2 === 0 ? "transparent" : "var(--bg-dark)", transition: "background 0.15s" }}
                  >
                    <td style={{ padding: "9px 14px", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{row.timestamp}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 600 }}>{row.ticker}</td>
                    <td style={{ padding: "9px 14px" }}>{badge(row.signal)}</td>
                    <td style={{ padding: "9px 14px" }}>₹{row.price?.toFixed(2)}</td>
                    <td style={{ padding: "9px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 50, height: 4, background: "var(--border-color)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${row.confidence_pct}%`, height: "100%", background: row.signal === "BUY" ? "var(--signal-buy)" : row.signal === "SELL" ? "var(--signal-sell)" : "var(--signal-hold)" }} />
                        </div>
                        <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{row.confidence_pct?.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "9px 14px", color: "var(--signal-buy)" }}>{(row.buy_prob * 100)?.toFixed(1)}%</td>
                    <td style={{ padding: "9px 14px", color: "var(--signal-sell)" }}>{(row.sell_prob * 100)?.toFixed(1)}%</td>
                    <td style={{ padding: "9px 14px", fontSize: "1.1rem" }}>{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
