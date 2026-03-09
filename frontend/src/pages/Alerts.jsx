import React, { useState, useEffect } from 'react';
import { fetchAlerts, createAlert, deleteAlert, toggleAlert, fetchNotifications } from '../services/alertService';
import { Loader } from '../components/common/Loader';
import { formatDateTime } from '../utils/formatters';

const ALERT_TYPES   = ['price_above', 'price_below', 'signal_buy', 'signal_sell', 'percent_change'];
const CHANNELS      = ['email', 'sms', 'slack'];

export default function Alerts() {
  const [alerts,  setAlerts]  = useState([]);
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    ticker: '', type: 'price_above', threshold: '', channel: 'email',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const [a, n] = await Promise.all([fetchAlerts(), fetchNotifications()]);
      setAlerts(Array.isArray(a) ? a : a.alerts || []);
      setNotifs(Array.isArray(n) ? n : n.notifications || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const newAlert = await createAlert(form);
      setAlerts((prev) => [newAlert, ...prev]);
      setForm({ ticker: '', type: 'price_above', threshold: '', channel: 'email' });
    } catch (e) { setError(e.message); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (e) { setError(e.message); }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await toggleAlert(id);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, ...updated } : a));
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Alert Manager</div>
          <div className="page-subtitle">Real-time price & signal notifications</div>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* Create alert form */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="section-title">Create New Alert</div>
        <form onSubmit={handleCreate}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Ticker</label>
              <input className="form-control" placeholder="AAPL" value={form.ticker}
                onChange={(e) => set('ticker', e.target.value.toUpperCase())} required />
            </div>
            <div className="form-group">
              <label className="form-label">Alert Type</label>
              <select className="form-control" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {ALERT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Threshold</label>
              <input className="form-control" placeholder="e.g. 180.00" value={form.threshold}
                onChange={(e) => set('threshold', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Notify via</label>
              <select className="form-control" value={form.channel} onChange={(e) => set('channel', e.target.value)}>
                {CHANNELS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={creating}>
            {creating ? '...' : '+ Create Alert'}
          </button>
        </form>
      </div>

      <div className="grid-2">
        {/* Active alerts */}
        <div>
          <div className="section-title">Active Alerts ({alerts.length})</div>
          {loading ? <Loader /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.length === 0 && <div className="empty-state">No alerts configured</div>}
              {alerts.map((a) => (
                <div key={a.id} className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {a.ticker}
                      </span>
                      <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {(a.type || '').replace(/_/g, ' ')}
                      </span>
                      {a.threshold && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)' }}>
                          @ {a.threshold}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => handleToggle(a.id)}
                      >
                        {a.enabled ? '⏸ Pause' : '▶ Enable'}
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => handleDelete(a.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Channel: {a.channel} &nbsp;·&nbsp;
                    Status: <span style={{ color: a.enabled ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {a.enabled ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications log */}
        <div>
          <div className="section-title">Recent Notifications</div>
          {loading ? <Loader /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifs.length === 0 && <div className="empty-state">No notifications yet</div>}
              {notifs.slice(0, 20).map((n, i) => (
                <div key={i} className="card" style={{ padding: '12px 16px', borderLeft: '3px solid var(--accent-blue)' }}>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {n.message || `${n.ticker} — ${n.type}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {formatDateTime(n.fired_at || n.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
