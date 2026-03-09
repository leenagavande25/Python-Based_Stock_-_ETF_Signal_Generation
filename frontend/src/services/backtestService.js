import api from './api';

/**
 * Backtesting API calls.
 */

// POST /backtest/run — submit a backtest job
export const runBacktest = (payload) =>
  api.post('/backtest/run', payload).then((r) => r.data);

// GET /backtest/:id — poll result of a running backtest
export const fetchBacktestResult = (id) =>
  api.get(`/backtest/${id}`).then((r) => r.data);

// GET /backtest/history — list of past backtests
export const fetchBacktestHistory = () =>
  api.get('/backtest/history').then((r) => r.data);
