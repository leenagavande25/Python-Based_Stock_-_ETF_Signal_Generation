import { useState } from "react";
import { api } from "../utils/api";

const STOCKS = [
  "RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK",
  "HINDUNILVR","ITC","SBIN","BHARTIARTL","KOTAKBANK"
];

export default function Backtest({ ticker: initialTicker }) {

  const [ticker, setTicker] = useState(initialTicker ?? "TCS");
  const [days, setDays] = useState(252);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = () => {
    setLoading(true);
    setError(null);
    setResult(null);

    api.getBacktest(ticker, days)
      .then(data => {
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Backtest failed. Check backend.");
        setLoading(false);
      });
  };

  const isPositive = v => parseFloat(v) >= 0;

  return (
    <div style={{ paddingTop: 32 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#00d4ff", letterSpacing: "0.2em", marginBottom: 8 }}>
          STRATEGY VALIDATION
        </div>

        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#e0eaff",
          margin: 0
        }}>
          Backtester
        </h1>

        <p style={{ color: "#4a6380", marginTop: 8, fontSize: 13 }}>
          Simulate ML signal strategy against historical price data
        </p>
      </div>


      {/* Controls */}
      <div style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: 24,
        marginBottom: 24,
        display: "flex",
        gap: 16,
        alignItems: "flex-end",
        flexWrap: "wrap",
      }}>

        {/* Stock selector */}
        <div>
          <label style={{
            fontSize: 11,
            color: "#4a6380",
            letterSpacing: "0.1em",
            display: "block",
            marginBottom: 6
          }}>
            STOCK
          </label>

          <select
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e0eaff",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            {STOCKS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>


        {/* Days selector */}
        <div>
          <label style={{
            fontSize: 11,
            color: "#4a6380",
            letterSpacing: "0.1em",
            display: "block",
            marginBottom: 6
          }}>
            LOOKBACK PERIOD
          </label>

          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e0eaff",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            <option value={63}>3 Months</option>
            <option value={126}>6 Months</option>
            <option value={252}>1 Year</option>
            <option value={504}>2 Years</option>
          </select>
        </div>


        {/* Run button */}
        <button
          onClick={run}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg,#00d4ff22,#0066ff22)",
            border: "1px solid rgba(0,212,255,0.3)",
            color: "#00d4ff",
            borderRadius: 10,
            padding: "10px 28px",
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "⟳ Running..." : "▶ Run Backtest"}
        </button>

      </div>


      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(255,77,109,0.08)",
          border: "1px solid rgba(255,77,109,0.2)",
          borderRadius: 10,
          padding: 16,
          color: "#ff4d6d",
          fontSize: 14,
          marginBottom: 20
        }}>
          {error}
        </div>
      )}


      {/* Results */}
      {result && (
        <div style={{
          background: "rgb(172, 159, 201)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: 20
        }}>

          <h3 style={{ color: "#e0eaff", marginBottom: 16 }}>
            Backtest Results
          </h3>

          <p>Strategy Return: {result.strategy_return}%</p>
          <p>Buy & Hold Return: {result.buy_hold_return}%</p>
          <p>Sharpe Ratio: {result.sharpe_ratio}</p>
          <p>Max Drawdown: {result.max_drawdown}%</p>
          <p>Total Trades: {result.total_trades}</p>
          <p>Win Rate: {result.win_rate}%</p>

        </div>
      )}

    </div>
  );
}