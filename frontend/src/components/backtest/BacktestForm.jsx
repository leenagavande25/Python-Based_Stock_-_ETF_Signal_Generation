import React, { useState } from 'react';
import { InlineLoader } from '../common/Loader';

const MODELS    = ['Random Forest', 'LSTM', 'Gradient Boosting', 'SVM'];
const TIMEFRAMES = ['1mo', '3mo', '6mo', '1y', '2y', '5y'];

export default function BacktestForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState({
    ticker:     '',
    model:      'Random Forest',
    timeframe:  '6mo',
    initial_capital: 10000,
    stop_loss:  5,
    take_profit: 10,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(form);
  };

  return (
    <div className="card">
      <div className="section-title">Backtest Configuration</div>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Ticker Symbol</label>
            <input
              className="form-control"
              placeholder="e.g. AAPL, SPY"
              value={form.ticker}
              onChange={(e) => set('ticker', e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">ML Model</label>
            <select className="form-control" value={form.model} onChange={(e) => set('model', e.target.value)}>
              {MODELS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Time Period</label>
            <select className="form-control" value={form.timeframe} onChange={(e) => set('timeframe', e.target.value)}>
              {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Initial Capital ($)</label>
            <input
              className="form-control"
              type="number"
              min={100}
              value={form.initial_capital}
              onChange={(e) => set('initial_capital', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Stop Loss (%)</label>
            <input
              className="form-control"
              type="number"
              min={1} max={50}
              value={form.stop_loss}
              onChange={(e) => set('stop_loss', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Take Profit (%)</label>
            <input
              className="form-control"
              type="number"
              min={1} max={100}
              value={form.take_profit}
              onChange={(e) => set('take_profit', Number(e.target.value))}
            />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <><InlineLoader /> Running...</> : '▶ Run Backtest'}
        </button>
      </form>
    </div>
  );
}
