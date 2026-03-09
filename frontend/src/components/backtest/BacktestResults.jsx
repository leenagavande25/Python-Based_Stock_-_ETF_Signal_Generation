import React from 'react';
import { formatPrice, formatPercent, formatNumber } from '../../utils/formatters';
import EquityCurveChart from '../charts/EquityCurveChart';

const MetricCard = ({ label, value, color }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={color ? { color } : {}}>{value}</div>
  </div>
);

export default function BacktestResults({ result }) {
  if (!result) return null;

  const m = result.metrics || result;

  return (
    <div style={{ marginTop: 28 }}>
      <div className="section-title">Results — {result.ticker}</div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <MetricCard label="Total Return"    value={formatPercent(m.total_return)}     color={m.total_return >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'} />
        <MetricCard label="Sharpe Ratio"    value={formatNumber(m.sharpe_ratio, 2)} />
        <MetricCard label="Max Drawdown"    value={formatPercent(m.max_drawdown)}     color="var(--accent-red)" />
        <MetricCard label="Win Rate"        value={formatPercent(m.win_rate)}         color="var(--accent-green)" />
        <MetricCard label="Total Trades"    value={m.total_trades ?? '—'} />
        <MetricCard label="Final Capital"   value={formatPrice(m.final_capital)} />
      </div>

      {result.equity_curve?.length > 0 && (
        <EquityCurveChart curve={result.equity_curve} title="Equity Curve" />
      )}

      {result.trades?.length > 0 && (
        <div className="table-wrap" style={{ marginTop: 20 }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>P&L</th>
                <th>Return</th>
              </tr>
            </thead>
            <tbody>
              {result.trades.map((t, i) => (
                <tr key={i}>
                  <td>{t.date || t.entry_date}</td>
                  <td>
                    <span className={`badge ${t.type === 'LONG' ? 'badge-buy' : 'badge-sell'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td>{formatPrice(t.entry_price)}</td>
                  <td>{formatPrice(t.exit_price)}</td>
                  <td style={{ color: t.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {formatPrice(t.pnl)}
                  </td>
                  <td>
                    <span className={`stat-change ${t.return_pct >= 0 ? 'up' : 'down'}`}>
                      {formatPercent(t.return_pct)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
