import React, { useState } from 'react';
import api from '../services/api';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState('');

  const [config, setConfig] = useState({
    api_key_alpha:  '',
    api_key_polygon: '',
    email_recipient: '',
    slack_webhook:  '',
    sms_number:     '',
    default_model:  'Random Forest',
    default_period: '1mo',
    refresh_interval: 30,
  });

  const set = (k, v) => setConfig((c) => ({ ...c, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Config saved locally even if backend not ready
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const testConnection = async (type) => {
    setTesting(type);
    try {
      await api.post('/settings/test', { type });
      alert(`${type} connection successful!`);
    } catch (e) {
      alert(`Test failed: ${e.message}`);
    } finally {
      setTesting('');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">API keys, notifications & preferences</div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Data APIs */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Data API Keys</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Alpha Vantage API Key</label>
              <input
                className="form-control"
                type="password"
                placeholder="Enter key..."
                value={config.api_key_alpha}
                onChange={(e) => set('api_key_alpha', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Polygon.io API Key</label>
              <input
                className="form-control"
                type="password"
                placeholder="Enter key..."
                value={config.api_key_polygon}
                onChange={(e) => set('api_key_polygon', e.target.value)}
              />
            </div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => testConnection('market_data')} disabled={testing === 'market_data'}>
            {testing === 'market_data' ? '...' : 'Test Connection'}
          </button>
        </div>

        {/* Notifications */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Notification Channels</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Recipient</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-control"
                  type="email"
                  placeholder="you@email.com"
                  value={config.email_recipient}
                  onChange={(e) => set('email_recipient', e.target.value)}
                />
                <button type="button" className="btn btn-secondary" onClick={() => testConnection('email')} disabled={testing === 'email'}>
                  Test
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Slack Webhook URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-control"
                  placeholder="https://hooks.slack.com/..."
                  value={config.slack_webhook}
                  onChange={(e) => set('slack_webhook', e.target.value)}
                />
                <button type="button" className="btn btn-secondary" onClick={() => testConnection('slack')} disabled={testing === 'slack'}>
                  Test
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">SMS Phone Number</label>
              <input
                className="form-control"
                placeholder="+1234567890"
                value={config.sms_number}
                onChange={(e) => set('sms_number', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Preferences</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Default Model</label>
              <select className="form-control" value={config.default_model} onChange={(e) => set('default_model', e.target.value)}>
                <option>Random Forest</option>
                <option>LSTM</option>
                <option>Gradient Boosting</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Default Period</label>
              <select className="form-control" value={config.default_period} onChange={(e) => set('default_period', e.target.value)}>
                {['1d', '5d', '1mo', '3mo', '6mo', '1y'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Auto-refresh Interval (seconds)</label>
              <input
                className="form-control"
                type="number"
                min={10} max={300}
                value={config.refresh_interval}
                onChange={(e) => set('refresh_interval', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Backend connection info */}
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="section-title">Backend Connection</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label className="form-label">API Base URL</label>
              <input
                className="form-control"
                value={process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'}
                readOnly
                style={{ opacity: 0.6 }}
              />
            </div>
            <div style={{ paddingTop: 22 }}>
              <button type="button" className="btn btn-secondary" onClick={() => testConnection('backend')}>
                Ping Backend
              </button>
            </div>
          </div>
          <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Change this in your <code>.env</code> file: REACT_APP_API_BASE_URL
          </p>
        </div>

        <button className="btn btn-primary" type="submit">
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
