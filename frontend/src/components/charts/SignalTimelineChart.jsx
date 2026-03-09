import React from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot,
} from 'recharts';
import { mergeSignalsWithHistory, toLineData } from '../../utils/chartHelpers';
import { formatPrice } from '../../utils/formatters';
import { Loader } from '../common/Loader';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ color: 'var(--accent-green)' }}>Close: {formatPrice(d.close)}</div>
      {d.signal && (
        <div style={{ marginTop: 4, color: d.signal === 'BUY' ? 'var(--accent-green)' : d.signal === 'SELL' ? 'var(--accent-red)' : 'var(--accent-yellow)' }}>
          ● {d.signal}
        </div>
      )}
    </div>
  );
};

export default function SignalTimelineChart({ history = [], signals = [], loading = false, title = 'Price & Signals' }) {
  const data = mergeSignalsWithHistory(toLineData(history), signals);
  const buyDots  = data.filter((d) => d.signal === 'BUY');
  const sellDots = data.filter((d) => d.signal === 'SELL');

  return (
    <div className="chart-container">
      <div className="chart-header">
        <span className="chart-title">{title}</span>
      </div>
      {loading ? <Loader height={260} /> : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} width={55} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="close" stroke="var(--accent-blue)" strokeWidth={2} dot={false} />
            {buyDots.map((d, i) => (
              <ReferenceDot key={`buy-${i}`} x={d.date} y={d.close} r={5} fill="var(--accent-green)" stroke="none" />
            ))}
            {sellDots.map((d, i) => (
              <ReferenceDot key={`sell-${i}`} x={d.date} y={d.close} r={5} fill="var(--accent-red)" stroke="none" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: 'var(--accent-blue)' }}>— Price</span>
        <span style={{ color: 'var(--accent-green)' }}>● BUY</span>
        <span style={{ color: 'var(--accent-red)' }}>● SELL</span>
      </div>
    </div>
  );
}
