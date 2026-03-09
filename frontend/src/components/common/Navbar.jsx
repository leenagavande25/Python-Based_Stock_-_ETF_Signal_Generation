import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard',   icon: '▦' },
  { path: '/signals',   label: 'Signals',     icon: '◈' },
  { path: '/backtest',  label: 'Backtest',    icon: '⟳' },
  { path: '/alerts',    label: 'Alerts',      icon: '◎' },
  { path: '/market',    label: 'Market Data', icon: '◉' },
  { path: '/settings',  label: 'Settings',    icon: '◧' },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">◈</span>
        <div>
          <div className="brand-name">SignalAI</div>
          <div className="brand-sub">Stock &amp; ETF Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            className={`nav-item ${pathname === path ? 'active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
            {pathname === path && <span className="nav-indicator" />}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="live-dot" />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          LIVE FEED
        </span>
      </div>
    </aside>
  );
}
