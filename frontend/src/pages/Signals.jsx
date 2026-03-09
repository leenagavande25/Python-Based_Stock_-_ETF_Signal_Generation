import React, { useState } from 'react';
import { useSignals, useGenerateSignals } from '../hooks/useSignals';
import { useHistory } from '../hooks/useMarketData';
import SignalTable from '../components/signals/SignalTable';
import SignalTimelineChart from '../components/charts/SignalTimelineChart';
import { InlineLoader } from '../components/common/Loader';

const TICKERS   = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'SPY', 'QQQ', 'AMZN', 'NVDA'];
const TIMEFRAMES = ['1d', '1w', '1mo'];
const MODELS     = ['Random Forest', 'LSTM', 'Gradient Boosting'];

export default function Signals() {
  const [ticker,    setTicker]    = useState('');
  const [timeframe, setTimeframe] = useState('1d');
  const [model,     setModel]     = useState('Random Forest');
  const [chartTicker, setChartTicker] = useState('');

  const { signals, loading, error, refetch } = useSignals(
    ticker ? { ticker, timeframe } : { timeframe }
  );

  const { generate, loading: genLoad, error: genError } = useGenerateSignals();

  const { history, loading: hLoad } = useHistory(chartTicker || ticker, '1mo');

  const handleGenerate = async () => {
    await generate({ ticker, model, timeframe });
    refetch();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Signal Generator</div>
          <div className="page-subtitle">ML-driven buy / sell / hold predictions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '0 0 160px' }}>
            <label className="form-label">Ticker</label>
            <input
              className="form-control"
              placeholder="e.g. AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '0 0 140px' }}>
            <label className="form-label">Timeframe</label>
            <select className="form-control" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '0 0 180px' }}>
            <label className="form-label">Model</label>
            <select className="form-control" value={model} onChange={(e) => setModel(e.target.value)}>
              {MODELS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={refetch}>↻ Refresh</button>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={genLoad || !ticker}
          >
            {genLoad ? <><InlineLoader />Generating...</> : '⚡ Generate Signal'}
          </button>
        </div>
      </div>

      {genError && <div className="error-box">{genError}</div>}

      {/* Quick ticker buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TICKERS.map((t) => (
          <button
            key={t}
            className={`btn btn-secondary ${chartTicker === t ? 'active-ticker' : ''}`}
            style={{ padding: '5px 12px', fontSize: 12 }}
            onClick={() => { setChartTicker(t); setTicker(t); }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chart */}
      {(chartTicker || ticker) && (
        <SignalTimelineChart
          history={history}
          signals={signals}
          loading={hLoad}
          title={`${chartTicker || ticker} — Price & Signals`}
        />
      )}

      {/* Table */}
      <div className="section-title">All Signals</div>
      <SignalTable signals={signals} loading={loading} error={error} />
    </div>
  );
}
