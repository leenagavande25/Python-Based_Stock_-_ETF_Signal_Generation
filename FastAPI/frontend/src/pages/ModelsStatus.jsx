import React from 'react';
import useSWR from 'swr';
import { BASE } from '../utils/api';
import { CheckCircle2, XCircle, Trash2, RefreshCcw } from 'lucide-react';

const fetcher = url => fetch(url).then(r => r.json());

const ModelsStatus = () => {
  const { data: models, mutate, isLoading } = useSWR(`${BASE}/api/models/status`, fetcher, { refreshInterval: 30000 });

  const clearCache = async () => {
    if(window.confirm("Drop all ML models from active RAM cache? They will reload on the next prediction request.")) {
      await fetch(`${BASE}/api/cache/clear`, { method: "POST" });
      mutate();
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2>ML Engine Status</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn" onClick={() => mutate()} disabled={isLoading} style={{ background: "var(--bg-card)" }}>
            <RefreshCcw size={16} className={isLoading ? "rotating" : ""} /> Refresh
          </button>
          <button className="btn" onClick={clearCache} style={{ background: "var(--signal-sell)" }}>
            <Trash2 size={16} /> Drop Cache
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid-container">
          {[1,2,3,4,5].map(i => <div key={i} className="card skeleton" style={{ height: "150px" }}></div>)}
        </div>
      )}

      {!isLoading && (
        <div className="grid-container">
          {models?.map(m => (
            <div key={m.ticker} className="card" style={{ borderLeft: m.status === 'Ready' ? '4px solid var(--signal-buy)' : '4px solid var(--signal-sell)' }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "600" }}>{m.ticker}</h3>
                {m.status === 'Ready' ? <CheckCircle2 color="var(--signal-buy)" /> : <XCircle color="var(--signal-sell)" />}
              </div>
              {m.status === 'Ready' ? (
                <>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Architecture: <span style={{ color: "var(--text-main)" }}>{m.model_type}</span></div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>Test Accuracy: <strong className="signal-buy">{(m.test_accuracy * 100).toFixed(1)}%</strong></div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "8px" }}>Compiled: {new Date(m.trained_at).toLocaleString()}</div>
                </>
              ) : (
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Model artifacts missing. Run <code style={{ color: "var(--text-main)" }}>train_models.py</code> to generate.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelsStatus;