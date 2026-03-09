import api from './api';

/**
 * All signal-related API calls.
 * Backend endpoints — coordinate with your team to match these exactly.
 */

// GET /signals?ticker=AAPL&timeframe=1d&limit=50
export const fetchSignals = (params = {}) =>
  api.get('/signals', { params }).then((r) => r.data);

// GET /signals/latest — most recent signal per ticker
export const fetchLatestSignals = () =>
  api.get('/signals/latest').then((r) => r.data);

// GET /signals/:ticker — all signals for one ticker
export const fetchSignalsByTicker = (ticker) =>
  api.get(`/signals/${ticker}`).then((r) => r.data);

// POST /signals/generate — trigger model to generate new signals
export const generateSignals = (payload) =>
  api.post('/signals/generate', payload).then((r) => r.data);
