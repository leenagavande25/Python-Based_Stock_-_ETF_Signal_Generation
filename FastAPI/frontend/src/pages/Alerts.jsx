import React, { useState } from 'react';
import useSWR from 'swr';
import { BASE } from '../utils/api';
import { Mail, Bell } from 'lucide-react';

const fetcher = url => fetch(url).then(r => r.json());

const Alerts = () => {
  const { data: status, mutate: mutateStatus } = useSWR(`${BASE}/api/alerts/status`, fetcher);
  const { data: watchlist } = useSWR(`${BASE}/api/watchlist`, fetcher);

  const [email, setEmail] = useState("");

  const updateEmail = async () => {
    if (!email) return;
    await fetch(`${BASE}/api/config/recipient`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    setEmail("");
    mutateStatus();
  };

  return (
    <div className="page-container">
      <h2>Real-Time Alert Configuration</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "32px", maxWidth: "600px" }}>The Backend API continuously probes technical indicators every 5 minutes and pushes automated notifications over SMTP directly to your inbox.</p>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        <div className="card" style={{ flex: "1 1 400px" }}>
          <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Mail size={18} color="var(--accent-blue)" /> Notification Endpoint
          </h3>
          
          <div style={{ marginBottom: "24px", padding: "16px", background: "var(--bg-dark)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Active Recipient Mailbox:</span>
            <div style={{ fontSize: "1.1rem", fontWeight: "600", marginTop: "4px", color: "var(--text-main)" }}>
              {status?.recipient || "Not Configured (Loading from .env)"}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input 
              type="email" 
              placeholder="Override Email Address..." 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ 
                flexGrow: 1, padding: "10px", 
                background: "var(--bg-dark)", border: "1px solid var(--border-color)", 
                borderRadius: "4px", color: "var(--text-main)", outline: "none", fontSize: "0.9rem"
              }}
            />
            <button className="btn" onClick={updateEmail}>Update</button>
          </div>
        </div>

        <div className="card" style={{ flex: "1 1 400px" }}>
          <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={18} color="var(--signal-hold)" /> Pipeline Triggers
          </h3>
          
          <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "8px" }}>
            {watchlist?.map(item => (
              <div key={item.ticker} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg-dark)", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "1.05rem" }}>{item.ticker}</strong>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Price Threshold: ₹{item.threshold}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  {status?.state?.[item.ticker]?.last_signal ? (
                    <span className={`signal-${status.state[item.ticker].last_signal.toLowerCase()}`} style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      {status.state[item.ticker].last_signal}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>Pending Scan...</span>
                  )}
                  {status?.state?.[item.ticker]?.price_alerted && (
                     <div style={{ color: "var(--signal-sell)", fontSize: "0.75rem", marginTop: "4px", fontWeight: "bold" }}>PRICE TRIGGERED</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;