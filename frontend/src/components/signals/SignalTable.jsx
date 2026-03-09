import React from 'react';
import { formatPrice, formatDateTime, signalBadgeClass, changeClass, formatPercent } from '../../utils/formatters';
import { SkeletonRow } from '../common/Loader';

export default function SignalTable({ signals = [], loading = false, error = null }) {
  if (error) return <div className="error-box">{error}</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Signal</th>
            <th>Price</th>
            <th>Confidence</th>
            <th>Change</th>
            <th>Model</th>
            <th>Generated At</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRow cols={7} rows={6} />
          ) : signals.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="empty-state">No signals available</div>
              </td>
            </tr>
          ) : (
            signals.map((s, i) => (
              <tr key={s.id || i}>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {s.ticker}
                </td>
                <td>
                  <span className={signalBadgeClass(s.signal)}>
                    {(s.signal || '').toUpperCase()}
                  </span>
                </td>
                <td>{formatPrice(s.price)}</td>
                <td>
                  <ConfidenceBar value={s.confidence} />
                </td>
                <td>
                  <span className={`stat-change ${changeClass(s.change_pct)}`}>
                    {formatPercent(s.change_pct)}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {s.model || '—'}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  {formatDateTime(s.generated_at || s.timestamp)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ConfidenceBar({ value }) {
  const pct = value != null ? Math.round(value * 100) : null;
  if (pct == null) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  const color = pct >= 70 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 60, height: 4,
        background: 'var(--border)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color }}>{pct}%</span>
    </div>
  );
}
