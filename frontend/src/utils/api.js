const BASE = "http://localhost:8000/api";

export const api = {
  getStocks:      () => fetch(`${BASE}/stocks`).then(r => r.json()),
  getAllSignals:   () => fetch(`${BASE}/signals/all`).then(r => r.json()),
  getSignal:      (t) => fetch(`${BASE}/signal/${t}`).then(r => r.json()),
  getLiveSignal:  (t) => fetch(`${BASE}/signal/${t}/live`).then(r => r.json()),
  getHistory:     (t, days=90) => fetch(`${BASE}/history/${t}?days=${days}`).then(r => r.json()),
  getBacktest:    (t, days=252) => fetch(`${BASE}/backtest/${t}?days=${days}`).then(r => r.json()),
  getModelsStatus:() => fetch(`${BASE}/models/status`).then(r => r.json()),
};