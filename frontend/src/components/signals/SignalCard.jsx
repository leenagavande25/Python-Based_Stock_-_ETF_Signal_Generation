import React from 'react';
import { formatPrice, formatPercent, signalBadgeClass, changeClass } from '../../utils/formatters';

export default function SignalCard({ signal }) {
  if (!signal) return null;
  const { ticker, signal: sig, price, change_pct, confidence, model } = signal;
  const pct = confidence != null ? Math.round(confidence * 100) : null;

  return (
    <div className={`card signal-card signal-card--${(sig || '').toLowerCase()}`}>
      <div className="signal-card-header">
        <span className="signal-ticker">{ticker}</span>
        <span className={signalBadgeClass(sig)}>{(sig || '').toUpperCase()}</span>
      </div>
      <div className="signal-price">{formatPrice(price)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <span className={`stat-change ${changeClass(change_pct)}`}>
          {formatPercent(change_pct)}
        </span>
        {pct != null && (
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Conf: {pct}%
          </span>
        )}
      </div>
      {model && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
          MODEL: {model}
        </div>
      )}
    </div>
  );
}
