import React, { useState } from "react";
import useSWR from "swr";
import { BASE } from "../utils/api";
import { Search, BarChart2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const fetcher = url => fetch(url).then(r => r.json());

const StatBox = ({ label, value, colorClass }) => (
  <div style={{ background: "var(--bg-dark)", padding: 16, borderRadius: 8, border: "1px solid var(--border-color)" }}>
    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 4 }}>{label}</div>
    <div className={colorClass} style={{ fontSize: "1.7rem", fontWeight: 700 }}>{value}</div>
  </div>
);

const Backtest = () => {
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const { data: watchlist, isLoading: wlLoading } = useSWR(`${BASE}/api/watchlist`, fetcher);

  const { data: bt, isLoading: btLoading, error: btError } = useSWR(
    selectedStock ? `${BASE}/api/backtest/${selectedStock}` : null,
    fetcher, { revalidateOnFocus: false }
  );

  // ── Chart Data ─────────────────────────────────────────────────────────────
  const chartData = bt?.portfolio_curve ? {
    labels: bt.portfolio_curve.dates,
    datasets: [
      {
        label: "Strategy",
        data: bt.portfolio_curve.strategy,
        borderColor: "var(--signal-buy)",
        backgroundColor: "rgba(0,184,148,0.08)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Market (Buy & Hold)",
        data: bt.portfolio_curve.market,
        borderColor: "var(--accent-blue)",
        backgroundColor: "rgba(41,98,255,0.06)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [4, 4],
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top", labels: { color: "#d1d4dc", font: { family: "Inter", size: 12 } } },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${(ctx.parsed.y * 100 - 100).toFixed(2)}% return`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#787b86", maxTicksLimit: 8, font: { family: "Inter" } }, grid: { color: "#2a2e39" } },
      y: {
        ticks: {
          color: "#787b86",
          font: { family: "Inter" },
          callback: v => `${((v - 1) * 100).toFixed(0)}%`,
        },
        grid: { color: "#2a2e39" },
      },
    },
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2>Strategy Backtester</h2>
      </div>

      {/* Ticker selector */}
      {!selectedStock && (
        <div className="card" style={{ maxWidth: 420 }}>
          <h3 style={{ marginBottom: 14, color: "var(--text-muted)", fontWeight: 500 }}>Select a Ticker</h3>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)" }} />
            <input
              type="text" placeholder="Filter…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "9px 10px 9px 30px", background: "var(--bg-dark)", border: "1px solid var(--border-color)", borderRadius: 4, color: "var(--text-main)", outline: "none" }}
            />
          </div>
          {wlLoading && <div className="skeleton" style={{ height: 200 }} />}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
            {watchlist?.filter(s => s.ticker.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
              <button
                key={s.ticker}
                className="btn"
                onClick={() => setSelectedStock(s.ticker)}
                style={{ background: "var(--bg-card-hover)", color: "var(--text-main)", border: "1px solid var(--border-color)", justifyContent: "space-between" }}
              >
                <span>{s.ticker}</span>
                <BarChart2 size={14} color="var(--accent-blue)" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backtest results */}
      {selectedStock && (
        <div>
          <button
            className="btn"
            onClick={() => setSelectedStock(null)}
            style={{ background: "var(--bg-card)", color: "var(--text-muted)", marginBottom: 20 }}
          >
            ← Back
          </button>

          {btLoading && <div className="skeleton" style={{ height: 350, borderRadius: 8 }} />}
          {btError && <div style={{ color: "var(--signal-sell)" }}>Failed to run backtest. Check API connectivity.</div>}

          {bt && !btLoading && (
            <>
              {/* Summary Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
                <StatBox label="Strategy Return" value={`${bt.strategy_return_pct >= 0 ? "+" : ""}${bt.strategy_return_pct?.toFixed(1)}%`} colorClass={bt.strategy_return_pct >= 0 ? "signal-buy" : "signal-sell"} />
                <StatBox label="Market Return" value={`${bt.market_return_pct >= 0 ? "+" : ""}${bt.market_return_pct?.toFixed(1)}%`} colorClass={bt.market_return_pct >= 0 ? "signal-buy" : "signal-sell"} />
                <StatBox label="Outperformance" value={`${bt.outperformance_pct >= 0 ? "+" : ""}${bt.outperformance_pct?.toFixed(1)}%`} colorClass={bt.outperformance_pct >= 0 ? "signal-buy" : "signal-sell"} />
                <StatBox label="Sharpe Ratio" value={bt.sharpe_ratio?.toFixed(2)} colorClass="signal-buy" />
                <StatBox label="Max Drawdown" value={`${bt.max_drawdown_pct?.toFixed(1)}%`} colorClass="signal-sell" />
                <StatBox label="Win Rate" value={`${bt.win_rate_pct?.toFixed(1)}%`} colorClass={bt.win_rate_pct >= 50 ? "signal-buy" : "signal-sell"} />
                <StatBox label="# Trades" value={bt.num_trades} colorClass="" />
                <StatBox label="Wins / Losses" value={`${bt.num_wins} / ${bt.num_losses}`} colorClass="signal-hold" />
              </div>

              {/* Portfolio Curve Chart */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16, color: "var(--text-muted)", fontWeight: 500 }}>
                  Portfolio Curve — {selectedStock} (5Y)
                </h3>
                <div style={{ height: 300 }}>
                  {chartData && <Line data={chartData} options={chartOptions} />}
                </div>
              </div>

              {/* Trade Log */}
              <div className="card">
                <h3 style={{ marginBottom: 14, color: "var(--text-muted)", fontWeight: 500 }}>
                  Trade Log ({bt.trade_log?.length} entries shown)
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                        {["Entry Date","Entry ₹","Exit Date","Exit ₹","P&L %","Result"].map(h => (
                          <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bt.trade_log?.map((t, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border-color)", background: i % 2 === 0 ? "transparent" : "var(--bg-dark)" }}>
                          <td style={{ padding: "8px 10px" }}>{t.entry_date}</td>
                          <td style={{ padding: "8px 10px" }}>₹{t.entry_price}</td>
                          <td style={{ padding: "8px 10px" }}>{t.exit_date}</td>
                          <td style={{ padding: "8px 10px" }}>₹{t.exit_price}</td>
                          <td style={{ padding: "8px 10px" }} className={t.pnl_pct >= 0 ? "signal-buy" : "signal-sell"}>
                            {t.pnl_pct >= 0 ? "+" : ""}{t.pnl_pct?.toFixed(2)}%
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{
                              padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600,
                              background: t.result.includes("WIN") ? "rgba(0,184,148,0.2)" : "rgba(255,82,82,0.2)",
                              color: t.result.includes("WIN") ? "var(--signal-buy)" : "var(--signal-sell)",
                            }}>
                              {t.result}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Backtest;