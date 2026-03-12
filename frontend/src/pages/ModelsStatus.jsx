import { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function ModelsStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getModelsStatus()
      .then(d => { setStatus(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingTop: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#00d4ff", letterSpacing: "0.2em", marginBottom: 8 }}>MACHINE LEARNING</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#e0eaff", margin: 0 }}>Model Registry</h1>
        <p style={{ color: "#4a6380", marginTop: 8, fontSize: 13 }}>
          Individual trained models (.pkl) for each of the Top 10 NSE stocks
        </p>
      </div>

      {/* Train instructions */}
      <div style={{
        background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)",
        borderRadius: 14, padding: 20, marginBottom: 24,
      }}>
        <div style={{ fontSize: 12, color: "#00d4ff", marginBottom: 10, letterSpacing: "0.1em" }}>HOW TO TRAIN MODELS</div>
        <code style={{ fontSize: 12, color: "#a0c4e0", lineHeight: 2, display: "block" }}>
          cd backend<br />
          pip install -r requirements.txt<br />
          python train_models.py
        </code>
        <div style={{ fontSize: 11, color: "#4a6380", marginTop: 10 }}>
          This trains Random Forest + Gradient Boosting on 3 years of NSE data and saves 10 .pkl files to backend/models/
        </div>
      </div>

      {loading && <div style={{ color: "#4a6380", textAlign: "center", padding: 48 }}>Loading...</div>}

      {status && (
        <>
          {/* Summary */}
          <div style={{
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "14px 20px", marginBottom: 20,
            display: "flex", gap: 32, alignItems: "center",
          }}>
            <div>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#00d4ff" }}>{status.trained}</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#4a6380" }}>/{status.total}</span>
              <div style={{ fontSize: 11, color: "#4a6380", letterSpacing: "0.1em" }}>MODELS TRAINED</div>
            </div>
            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
              <div style={{
                width: `${(status.trained / status.total) * 100}%`,
                height: "100%", background: "linear-gradient(90deg, #0066ff, #00d4ff)",
                borderRadius: 3, transition: "width 0.5s",
              }} />
            </div>
          </div>

          {/* Model table */}
          <div style={{
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, overflow: "hidden",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              padding: "10px 20px", fontSize: 10, color: "#4a6380",
              letterSpacing: "0.12em", textTransform: "uppercase",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span>Ticker</span>
              <span>Status</span>
              <span>Model</span>
              <span>Accuracy</span>
              <span>Samples</span>
            </div>
            {status.models.map((m, i) => (
              <div key={m.ticker} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                padding: "14px 20px", fontSize: 13,
                borderBottom: i < status.models.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                alignItems: "center",
              }}>
                <span style={{ color: "#e0eaff", fontWeight: 600 }}>{m.ticker}</span>
                <span style={{ color: m.trained ? "#00ff88" : "#ff4d6d" }}>
                  {m.trained ? "✓ Trained" : "✗ Pending"}
                </span>
                <span style={{ color: "#6b8aad", fontSize: 11 }}>{m.model_type || "—"}</span>
                <span style={{ color: m.accuracy > 0.6 ? "#00ff88" : "#ffd166" }}>
                  {m.accuracy ? `${(m.accuracy * 100).toFixed(1)}%` : "—"}
                </span>
                <span style={{ color: "#6b8aad", fontSize: 11 }}>
                  {m.train_samples ? `${m.train_samples} rows` : "—"}
                </span>
              </div>
            ))}
          </div>

          {/* Features used */}
          <div style={{
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: 20, marginTop: 20,
          }}>
            <div style={{ fontSize: 12, color: "#4a6380", letterSpacing: "0.1em", marginBottom: 14 }}>
              FEATURE ENGINEERING (19 FEATURES)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                "SMA_10","SMA_20","SMA_50","EMA_12","EMA_26",
                "MACD","MACD_signal","RSI",
                "BB_upper","BB_lower","BB_width",
                "Volume_ratio",
                "Return_1d","Return_5d","Return_10d",
                "High_Low_ratio","Close_Open_ratio",
                "SMA10_above_SMA20","Price_above_SMA50",
              ].map(f => (
                <span key={f} style={{
                  background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#00d4ff",
                }}>{f}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
