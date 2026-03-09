import React from 'react';
import { useBacktest } from '../hooks/useBacktest';
import BacktestForm from '../components/backtest/BacktestForm';
import BacktestResults from '../components/backtest/BacktestResults';
import { InlineLoader } from '../components/common/Loader';

export default function Backtest() {
  const { run, result, loading, polling, error } = useBacktest();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Backtester</div>
          <div className="page-subtitle">Validate ML strategies on historical data</div>
        </div>
      </div>

      <BacktestForm onSubmit={run} loading={loading} />

      {error && <div className="error-box" style={{ marginTop: 20 }}>{error}</div>}

      {polling && (
        <div className="card" style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <InlineLoader />
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: 13 }}>
            Backtest running on server — polling for results...
          </span>
        </div>
      )}

      <BacktestResults result={result} />
    </div>
  );
}
