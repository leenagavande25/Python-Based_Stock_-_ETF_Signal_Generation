// Transform raw backend data into Recharts-compatible format

/**
 * Convert history array [{date, open, high, low, close, volume}]
 * into Recharts LineChart data
 */
export const toLineData = (history = []) =>
  history.map((d) => ({
    date: d.date || d.timestamp,
    close: Number(d.close),
    open: Number(d.open),
    high: Number(d.high),
    low: Number(d.low),
    volume: Number(d.volume),
  }));

/**
 * Overlay signal dots on price history
 * signals: [{ticker, date, signal, price}]
 */
export const mergeSignalsWithHistory = (history = [], signals = []) => {
  const sigMap = {};
  signals.forEach((s) => { sigMap[s.date || s.timestamp] = s.signal; });

  return history.map((d) => ({
    ...d,
    signal: sigMap[d.date || d.timestamp] || null,
  }));
};

/**
 * Convert equity curve [{date, portfolio_value}]
 */
export const toEquityData = (curve = []) =>
  curve.map((d) => ({
    date: d.date || d.timestamp,
    value: Number(d.portfolio_value ?? d.value),
  }));

/**
 * Build pie chart data from allocation object
 * e.g. { AAPL: 0.4, GOOGL: 0.3, CASH: 0.3 }
 */
export const toAllocationData = (alloc = {}) =>
  Object.entries(alloc).map(([name, value]) => ({ name, value: Number(value) }));

// Recharts color palette
export const CHART_COLORS = [
  '#00d4a0', '#3d8ef8', '#ffd166', '#ff4d6d',
  '#c77dff', '#f77f00', '#4cc9f0', '#b5e48c',
];
