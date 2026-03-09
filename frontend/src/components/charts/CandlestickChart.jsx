import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { toLineData } from '../../utils/chartHelpers';
import { formatPrice } from '../../utils/formatters';
import { Loader } from '../common/Loader';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'var(--font-mono)',
      lineHeight: 1.8,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--accent-green)' }}>O: {formatPrice(d.open)}</div>
      <div style={{ color: 'var(--accent-red)' }}>H: {formatPrice(d.high)}</div>
      <div style={{ color: 'var(--accent-blue)' }}>L: {formatPrice(d.low)}</div>
      <div style={{ color: 'var(--text-primary)' }}>C: {formatPrice(d.close)}</div>
    </div>
  );
};

// Recharts doesn't have a native candlestick; we fake it with stacked bars
const buildCandleData = (history) =>
  toLineData(history).map((d) => {
    const isGreen = d.close >= d.open;
    const bodyLow  = Math.min(d.open, d.close);
    const bodyHigh = Math.max(d.open, d.close);
    return {
      ...d,
      wickLow:  d.low,
      wickHigh: d.high,
      bodyLow,
      bodySize: bodyHigh - bodyLow || 0.01,
      color: isGreen ? '#00d4a0' : '#ff4d6d',
    };
  });

export default function CandlestickChart({ history = [], loading = false, title = 'Price History' }) {
  const data = buildCandleData(history);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <span className="chart-title">{title}</span>
      </div>
      {loading ? <Loader height={260} /> : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} width={55} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            {/* Lower invisible bar to offset */}
            <Bar dataKey="bodyLow" stackId="candle" fill="transparent" />
            <Bar dataKey="bodySize" stackId="candle" fill="var(--accent-green)" radius={[2,2,0,0]} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
