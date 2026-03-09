// Number & currency formatters

export const formatPrice = (n, decimals = 2) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
};

export const formatPercent = (n, decimals = 2) => {
  if (n == null) return '—';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${Number(n).toFixed(decimals)}%`;
};

export const formatNumber = (n, decimals = 2) => {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatLargeNumber = (n) => {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9)  return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6)  return `${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3)  return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};

// Date formatters
export const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
};

// Signal helpers
export const signalColor = (signal) => {
  const s = (signal || '').toUpperCase();
  if (s === 'BUY')  return 'var(--accent-green)';
  if (s === 'SELL') return 'var(--accent-red)';
  return 'var(--accent-yellow)';
};

export const signalBadgeClass = (signal) => {
  const s = (signal || '').toUpperCase();
  if (s === 'BUY')  return 'badge badge-buy';
  if (s === 'SELL') return 'badge badge-sell';
  return 'badge badge-hold';
};

export const changeClass = (n) => {
  if (n == null) return '';
  return n >= 0 ? 'up' : 'down';
};
