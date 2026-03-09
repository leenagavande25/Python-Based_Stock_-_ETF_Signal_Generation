import React from 'react';

export function Loader({ height = 200 }) {
  return (
    <div className="loader-wrap" style={{ height }}>
      <div className="spinner" />
    </div>
  );
}

export function InlineLoader() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: '2px solid var(--border)',
      borderTopColor: 'var(--accent-green)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle',
      marginRight: 6,
    }} />
  );
}

export function SkeletonRow({ cols = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c}>
              <div className="skeleton" style={{ height: 14, width: '80%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
