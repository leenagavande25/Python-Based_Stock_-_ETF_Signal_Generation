import api from './api';

/**
 * Market data API calls.
 * Backend wraps Yahoo Finance / Alpha Vantage / Polygon.io
 */

// GET /market/quote?ticker=AAPL
export const fetchQuote = (ticker) =>
  api.get('/market/quote', { params: { ticker } }).then((r) => r.data);

// GET /market/history?ticker=AAPL&period=1mo&interval=1d
export const fetchHistory = (ticker, period = '1mo', interval = '1d') =>
  api.get('/market/history', { params: { ticker, period, interval } }).then((r) => r.data);

// GET /market/search?q=apple
export const searchTickers = (q) =>
  api.get('/market/search', { params: { q } }).then((r) => r.data);

// GET /market/overview — top movers / watchlist summary
export const fetchMarketOverview = () =>
  api.get('/market/overview').then((r) => r.data);

// GET /market/watchlist — user saved tickers
export const fetchWatchlist = () =>
  api.get('/market/watchlist').then((r) => r.data);
