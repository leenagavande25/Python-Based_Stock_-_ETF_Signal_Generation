import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar  from './components/common/Navbar';
import Topbar  from './components/common/Topbar';
import Dashboard  from './pages/Dashboard';
import Signals    from './pages/Signals';
import Backtest   from './pages/Backtest';
import Alerts     from './pages/Alerts';
import MarketData from './pages/MarketData';
import Settings   from './pages/Settings';
import './styles/index.css';
import './components/signals/SignalCard.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <div className="main-content">
          <Topbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/signals"  element={<Signals />} />
            <Route path="/backtest" element={<Backtest />} />
            <Route path="/alerts"   element={<Alerts />} />
            <Route path="/market"   element={<MarketData />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
