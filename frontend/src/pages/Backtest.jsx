import { useState } from "react";
import { api } from "../utils/api";

const STOCKS = ["RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK","HINDUNILVR","ITC","SBIN","BHARTIARTL","KOTAKBANK"];

export default function Backtest({ ticker: initialTicker }) {
  const [ticker, setTicker] = useState(initialTicker || "TCS");
  const [days, setDays]     = useState(252);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const run = () => {
    setLoading(true); setError(null); setResult(null);
    api.getBacktest(ticker, days)
      .then(d => { setResult(d); setLoading(false); })
      .catch(() => { setError("Backtest failed. Check backend."); setLoading(false); });
  };

  const isPositive = v => parseFloat(v) >= 0;

  return (
    <div style={{ paddingTop: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#00d4ff", letterSpacing: "0.2em", marginBottom: 8 }}>STRATEGY VALIDATION</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#e0eaff", margin: 0 }}>Backtester</h1>
        <p style={{ color: "#4a6380", marginTop: 8, fontSize: 13 }}>
          Simulate ML signal strategy against historical price data
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, padding: 24, marginBottom: 24,
        display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap",
      }}>
        <div>
          <label style={{ fontSize: 11, color: "#4a6380", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
            STOCK
          </label>
          <select value={ticker} onChange={e => setTicker(e.target.value)} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#e0eaff", borderRadius: 8, padding: "8px 12px", fontSize: 14,
            cursor: "pointer",
          }}>
            {STOCKS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#4a6380", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
            LOOKBACK PERIOD
          </label>
          <select value={days} onChange={e => setDays(Number(e.target.value))} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#e0eaff", borderRadius: 8, padding: "8px 12px", fontSize: 14, cursor: "pointer",
          }}>
            <option value={63}>3 Months</option>
            <option value={126}>6 Months</option>
            <option value={252}>1 Year</option>
            <option value={504}>2 Years</option>
          </select>
        </div>

        <button onClick={run} disabled={loading} style={{
          background: "linear-gradient(135deg, #00d4ff22, #0066ff22)",
          border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff",
          borderRadius: 10, padding: "10px 28px", fontSize: 14,
          cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.05em",
        }}>
          {loading ? "⟳ Running..." : "▶ Run Backtest"}
        </button>
      </div>

      {error && (
        <div style={{
          background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)",
          borderRadius: 10, padding: 16, color: "#ff4d6d", fontSize: 14, marginBottom: 20,
        }}>{error}</div>
      )}

      {result && (
        <>
          {/* Metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Strategy Return", val: `${result.strategy_return}%`, color: isPositive(result.strategy_return) ? "#00ff88" : "#ff4d6d" },
              { label: "Buy & Hold Return", val: `${result.buy_hold_return}%`, color: isPositive(result.buy_hold_return) ? "#00ff88" : "#ff4d6d" },
              { label: "Sharpe Ratio", val: result.sharpe_ratio, color: result.sharpe_ratio > 1 ? "#00ff88" : result.sharpe_ratio > 0 ? "#ffd166" : "#ff4d6d" },
              { label: "Max Drawdown", val: `${result.max_drawdown}%`, color: "#ff4d6d" },
              { label: "Win Rate", val: `${result.win_rate}%`, color: result.win_rate > 55 ? "#00ff88" : "#ffd166" },
              { label: "Total Trades", val: result.total_trades, color: "#e0eaff" },
            ].map(m => (
              <div key={m.label} style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "18px 20px",
              }}>
                <div style={{ fontSize: 10, color: "#4a6380", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: m.color }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Signal distribution */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: 20,
          }}>
            <div style={{ fontSize: 12, color: "#4a6380", letterSpacing: "0.1em", marginBottom: 16 }}>
              SIGNAL DISTRIBUTION ({result.backtest_days} DAYS)
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "BUY",  val: result.signal_distribution.BUY,  color: "#00ff88" },
                { label: "HOLD", val: result.signal_distribution.HOLD, color: "#ffd166" },
                { label: "SELL", val: result.signal_distribution.SELL, color: "#ff4d6d" },
              ].map(p => {
                const total = result.signal_distribution.BUY + result.signal_distribution.HOLD + result.signal_distribution.SELL;
                const pct = total ? (p.val / total * 100).toFixed(1) : 0;
                return (
                  <div key={p.label} style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: p.color }}>{p.label}</span>
                      <span style={{ color: "#6b8aad" }}>{p.val} days ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>
                      <div style={{
                        width: `${pct}%`, height: "100%", background: p.color, borderRadius: 4,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alpha */}
            <div style={{
              marginTop: 20, padding: "14px 16px",
              background: "rgba(255,255,255,0.02)", borderRadius: 10,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: "#4a6380" }}>Alpha vs Buy & Hold</span>
              <span style={{
                fontSize: 18, fontWeight: 700,
                color: (result.strategy_return - result.buy_hold_return) >= 0 ? "#00ff88" : "#ff4d6d",
              }}>
                {(result.strategy_return - result.buy_hold_return) >= 0 ? "+" : ""}
                {(result.strategy_return - result.buy_hold_return).toFixed(2)}%
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
