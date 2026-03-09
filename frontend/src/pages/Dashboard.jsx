import React from 'react';
import { useLatestSignals } from '../hooks/useSignals';
import { useMarketOverview } from '../hooks/useMarketData';
import SignalCard from '../components/signals/SignalCard';
import SignalTimelineChart from '../components/charts/SignalTimelineChart';
import { Loader } from '../components/common/Loader';
import { formatPrice, formatPercent, changeClass } from '../utils/formatters';
import './Dashboard.css';

export default function Dashboard() {
  const { signals, loading: sLoad } = useLatestSignals();
  const { data: overview, loading: oLoad } = useMarketOverview();

  const stats = overview?.stats || {};
  const topMovers = overview?.top_movers || [];
  const recentHistory = overview?.recent_history || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">
            <span className="live-dot" /> Real-time overview
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stat-grid">
        <div className="stat-card green">
          <div className="stat-label">Active Signals</div>
          <div className="stat-value">{oLoad ? '—' : (stats.active_signals ?? signals.length)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tickers Tracked</div>
          <div className="stat-value">{oLoad ? '—' : (stats.tickers_tracked ?? '—')}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Model Accuracy</div>
          <div className="stat-value">{oLoad ? '—' : (stats.model_accuracy ? `${stats.model_accuracy}%` : '—')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Alerts Fired Today</div>
          <div className="stat-value">{oLoad ? '—' : (stats.alerts_today ?? '—')}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Latest Signals */}
        <div>
          <div className="section-title">Latest Signals</div>
          {sLoad ? <Loader /> : (
            <div className="signal-cards-grid">
              {signals.slice(0, 6).map((s, i) => (
                <SignalCard key={s.id || i} signal={s} />
              ))}
              {signals.length === 0 && <div className="empty-state">No signals yet</div>}
            </div>
          )}
        </div>

        {/* Top Movers */}
        <div>
          <div className="section-title">Top Movers</div>
          {oLoad ? <Loader /> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Price</th>
                    <th>Change</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {topMovers.length === 0 ? (
                    <tr><td colSpan={4}><div className="empty-state">No data</div></td></tr>
                  ) : topMovers.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{t.ticker}</td>
                      <td>{formatPrice(t.price)}</td>
                      <td>
                        <span className={`stat-change ${changeClass(t.change_pct)}`}>
                          {formatPercent(t.change_pct)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{t.volume_str || t.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Price chart */}
      {recentHistory.length > 0 && (
        <SignalTimelineChart
          history={recentHistory}
          signals={signals}
          title="Market Overview — Recent Price Action"
        />
      )}
    </div>
  );
}
