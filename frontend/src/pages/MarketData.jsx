import React, { useState } from 'react';
import { useQuote, useHistory, useTickerSearch } from '../hooks/useMarketData';
import CandlestickChart from '../components/charts/CandlestickChart';
import { formatPrice, formatPercent, formatLargeNumber, changeClass } from '../utils/formatters';
import { Loader } from '../components/common/Loader';

const PERIODS    = ['5d', '1mo', '3mo', '6mo', '1y'];
const INTERVALS  = ['1d', '1wk', '1mo'];
const WATCHLIST  = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'SPY', 'QQQ', 'NVDA', 'AMZN'];

export default function MarketData() {
  const [ticker,   setTicker]   = useState('AAPL');
  const [input,    setInput]    = useState('AAPL');
  const [period,   setPeriod]   = useState('1mo');
  const [interval, setInterval] = useState('1d');

  const { quote,   loading: qLoad, error: qErr } = useQuote(ticker);
  const { history, loading: hLoad }              = useHistory(ticker, period, interval);
  const { results, search }                      = useTickerSearch();

  const handleSearch = (e) => {
    setInput(e.target.value.toUpperCase());
    search(e.target.value);
  };

  const selectTicker = (t) => { setTicker(t); setInput(t); };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Market Data</div>
          <div className="page-subtitle">Live quotes & historical price data</div>
        </div>
      </div>

      {/* Search bar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '0 0 200px', position: 'relative' }}>
            <label className="form-label">Search Ticker</label>
            <input
              className="form-control"
              placeholder="Type ticker..."
              value={input}
              onChange={handleSearch}
              onKeyDown={(e) => e.key === 'Enter' && selectTicker(input)}
            />
            {results.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', marginTop: 4,
              }}>
                {results.slice(0, 6).map((r, i) => (
                  <div key={i}
                    onClick={() => { selectTicker(r.symbol || r.ticker); }}
                    style={{
                      padding: '8px 12px', cursor: 'pointer',
                      fontSize: 12, fontFamily: 'var(--font-mono)',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <strong>{r.symbol || r.ticker}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{r.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Period</label>
            <select className="form-control" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Interval</label>
            <select className="form-control" value={interval} onChange={(e) => setInterval(e.target.value)}>
              {INTERVALS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => selectTicker(input)}>Load</button>
        </div>
      </div>

      {/* Quick watchlist */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {WATCHLIST.map((t) => (
          <button
            key={t}
            onClick={() => selectTicker(t)}
            className="btn btn-secondary"
            style={{
              padding: '5px 12px', fontSize: 12,
              ...(ticker === t ? { borderColor: 'var(--accent-green)', color: 'var(--accent-green)' } : {}),
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {qErr && <div className="error-box">{qErr}</div>}

      {/* Quote stats */}
      {qLoad ? <Loader /> : quote && (
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Price</div>
            <div className="stat-value">{formatPrice(quote.price || quote.current_price)}</div>
          </div>
          <div className={`stat-card ${(quote.change_pct || quote.change_percent) >= 0 ? 'green' : 'red'}`}>
            <div className="stat-label">Change</div>
            <div className="stat-value">
              <span className={`stat-change ${changeClass(quote.change_pct || quote.change_percent)}`}>
                {formatPercent(quote.change_pct || quote.change_percent)}
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Market Cap</div>
            <div className="stat-value" style={{ fontSize: 18 }}>
              {formatLargeNumber(quote.market_cap)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Volume</div>
            <div className="stat-value" style={{ fontSize: 18 }}>
              {formatLargeNumber(quote.volume)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">52W High</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{formatPrice(quote.week52_high)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">52W Low</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{formatPrice(quote.week52_low)}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <CandlestickChart history={history} loading={hLoad} title={`${ticker} — ${period} Price History`} />
    </div>
  );
}
