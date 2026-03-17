const BASE = "http://localhost:8000";

export const api = {

getAllSignals: () =>
fetch(`${BASE}/api/signals/all`).then(r=>r.json()),

getSignal: ticker =>
fetch(`${BASE}/api/signal/${ticker}`).then(r=>r.json()),

getLiveSignal: ticker =>
fetch(`${BASE}/api/signal/${ticker}/live`).then(r=>r.json()),

getHistory: (ticker,days=90) =>
fetch(`${BASE}/api/history/${ticker}?days=${days}`).then(r=>r.json()),

getBacktest: (ticker,days=252) =>
fetch(`${BASE}/api/backtest/${ticker}?days=${days}`).then(r=>r.json()),

getModelsStatus: () =>
fetch(`${BASE}/api/models/status`).then(r=>r.json())

};