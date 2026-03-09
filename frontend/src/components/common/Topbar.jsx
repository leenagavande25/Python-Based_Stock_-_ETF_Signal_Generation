import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Navbar.css';

const PAGE_TITLES = {
  '/':          'DASHBOARD',
  '/signals':   'SIGNAL GENERATOR',
  '/backtest':  'BACKTESTER',
  '/alerts':    'ALERT MANAGER',
  '/market':    'MARKET DATA',
  '/settings':  'SETTINGS',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">{PAGE_TITLES[pathname] || ''}</div>
      <div className="topbar-right">
        <span className="topbar-time">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
    </header>
  );
}
