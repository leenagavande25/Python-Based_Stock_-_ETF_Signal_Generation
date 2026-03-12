import { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";
import SignalBadge from "../components/SignalBadge";

export default function StockDetail({ ticker, navigate }) {
  const [history, setHistory]       = useState(null);
  const [signal, setSignal]         = useState(null);
  const [liveSignal, setLiveSignal] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!ticker) return;
    Promise.all([api.getHistory(ticker, 90), api.getSignal(ticker)])
      .then(([h, s]) => { setHistory(h); setSignal(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ticker]);

  useEffect(() => {
    if (history?.history && canvasRef.current) drawChart(history.history, canvasRef.current);
  }, [history]);

  const fetchLive = () => {
    setLiveLoading(true);
    api.getLiveSignal(ticker)
      .then(d => { setLiveSignal(d); setLiveLoading(false); })
      .catch(() => setLiveLoading(false));
  };

  if (!ticker) return <div style={{ color: "#6b8aad", padding: 48 }}>No stock selected.</div>;

  const s = signal;
  const ind = liveSignal?.indicators;

  return (
    <div style={{ paddingTop: 32 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => navigate("dashboard")} style={{
          background: "none", border: "none", color: "#4a6380",
          cursor: "pointer", fontSize: 13, padding: 0,
        }}>← Dashboard</button>
        <span style={{ color: "#1e2d4a" }}>/</span>
        <span style={{ color: "#00d4ff", fontSize: 13 }}>{ticker}</span>
      </div>

      {loading ? (
        <div style={{ color: "#4a6380", padding: 48, textAlign: "center" }}>Loading...</div>
      ) : (
        <>
          {/* Stock header */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: 28, marginBottom: 20,
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: "#e0eaff", margin: "0 0 4px" }}>{ticker}</h1>
              <div style={{ fontSize: 12, color: "#4a6380", letterSpacing: "0.1em" }}>{s?.sector}</div>
              {s?.latest_close && (
                <div style={{ fontSize: 28, fontWeight: 700, color: "#e0eaff", marginTop: 12 }}>
                  ₹{s.latest_close?.toLocaleString("en-IN")}
                  <span style={{ fontSize: 12, color: "#4a6380", marginLeft: 8 }}>{s.latest_date}</span>
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <SignalBadge signal={s?.signal || "N/A"} large />
              <div style={{ marginTop: 10, fontSize: 11, color: "#4a6380" }}>
                {s?.model_type} · {s?.accuracy ? `${(s.accuracy * 100).toFixed(1)}% acc` : ""}
              </div>
            </div>
          </div>

          {/* Live signal button */}
          <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={fetchLive} disabled={liveLoading} style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,102,255,0.15))",
              border: "1px solid rgba(0,212,255,0.3)",
              color: "#00d4ff", borderRadius: 10, padding: "10px 24px",
              fontSize: 13, cursor: "pointer", letterSpacing: "0.05em",
            }}>
              {liveLoading ? "⟳ Fetching..." : "⚡ Get Live Signal"}
            </button>
            <button onClick={() => navigate("backtest", ticker)} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#6b8aad", borderRadius: 10, padding: "10px 24px",
              fontSize: 13, cursor: "pointer",
            }}>
              📊 Run Backtest
            </button>
          </div>

          {/* Live signal result */}
          {liveSignal && (
            <div style={{
              background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: 14, padding: 20, marginBottom: 20,
              display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start",
            }}>
              <div>
                <div style={{ fontSize: 11, color: "#00d4ff", letterSpacing: "0.15em", marginBottom: 8 }}>LIVE SIGNAL</div>
                <SignalBadge signal={liveSignal.signal} large />
                <div style={{ marginTop: 8, fontSize: 10, color: "#4a6380" }}>
                  {new Date(liveSignal.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {ind && [
                  { label: "RSI",     val: ind.rsi,          color: ind.rsi > 70 ? "#ff4d6d" : ind.rsi < 30 ? "#00ff88" : "#e0eaff" },
                  { label: "MACD",    val: ind.macd?.toFixed(2), color: ind.macd > 0 ? "#00ff88" : "#ff4d6d" },
                  { label: "SMA 10",  val: `₹${ind.sma_10}`, color: "#e0eaff" },
                  { label: "Vol Ratio",val: ind.volume_ratio?.toFixed(2), color: "#e0eaff" },
                ].map(i => (
                  <div key={i.label} style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px",
                  }}>
                    <div style={{ fontSize: 10, color: "#4a6380", letterSpacing: "0.1em" }}>{i.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: i.color, marginTop: 2 }}>{i.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price chart */}
          {history?.history?.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 20, marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, color: "#4a6380", letterSpacing: "0.1em", marginBottom: 14 }}>
                PRICE HISTORY · 90 DAYS
              </div>
              <canvas ref={canvasRef} width={800} height={200}
                style={{ width: "100%", height: 200 }} />
            </div>
          )}

          {/* Probability breakdown */}
          {s?.probabilities && (
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 20,
            }}>
              <div style={{ fontSize: 12, color: "#4a6380", letterSpacing: "0.1em", marginBottom: 16 }}>
                SIGNAL PROBABILITIES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "BUY",  val: s.probabilities.BUY,  color: "#00ff88" },
                  { label: "HOLD", val: s.probabilities.HOLD, color: "#ffd166" },
                  { label: "SELL", val: s.probabilities.SELL, color: "#ff4d6d" },
                ].map(p => (
                  <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 36, fontSize: 12, color: p.color, fontWeight: 600 }}>{p.label}</span>
                    <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>
                      <div style={{
                        width: `${(p.val * 100).toFixed(1)}%`, height: "100%",
                        background: `linear-gradient(90deg, ${p.color}99, ${p.color})`,
                        borderRadius: 4,
                      }} />
                    </div>
                    <span style={{ width: 48, textAlign: "right", fontSize: 14, fontWeight: 700, color: p.color }}>
                      {(p.val * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function drawChart(data, canvas) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const PAD = { top: 10, right: 20, bottom: 30, left: 60 };
  ctx.clearRect(0, 0, W, H);

  const closes = data.map(d => d.close).filter(Boolean);
  const min = Math.min(...closes) * 0.995;
  const max = Math.max(...closes) * 1.005;
  const toX = i => PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right);
  const toY = v => PAD.top + (1 - (v - min) / (max - min)) * (H - PAD.top - PAD.bottom);

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = PAD.top + (i / 4) * (H - PAD.top - PAD.bottom);
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
    const val = max - (i / 4) * (max - min);
    ctx.fillStyle = "#4a6380"; ctx.font = "10px DM Mono,monospace";
    ctx.textAlign = "right";
    ctx.fillText(`₹${val.toFixed(0)}`, PAD.left - 4, y + 3);
  }

  // SMA 20
  ctx.beginPath(); ctx.strokeStyle = "rgba(255,209,102,0.5)"; ctx.lineWidth = 1;
  data.forEach((d, i) => { if (d.sma_20) ctx.lineTo(toX(i), toY(d.sma_20)); });
  ctx.stroke();

  // Area fill
  const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
  grad.addColorStop(0, "rgba(0,212,255,0.2)");
  grad.addColorStop(1, "rgba(0,212,255,0)");
  ctx.beginPath();
  data.forEach((d, i) => d.close && (i === 0 ? ctx.moveTo(toX(i), toY(d.close)) : ctx.lineTo(toX(i), toY(d.close))));
  ctx.lineTo(toX(data.length - 1), H - PAD.bottom);
  ctx.lineTo(toX(0), H - PAD.bottom);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

  // Price line
  ctx.beginPath(); ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 2;
  data.forEach((d, i) => d.close && (i === 0 ? ctx.moveTo(toX(i), toY(d.close)) : ctx.lineTo(toX(i), toY(d.close))));
  ctx.stroke();

  // Date labels
  ctx.fillStyle = "#4a6380"; ctx.font = "9px DM Mono,monospace"; ctx.textAlign = "center";
  [0, Math.floor(data.length/2), data.length - 1].forEach(i => {
    ctx.fillText(data[i]?.date?.slice(5) || "", toX(i), H - 6);
  });
}
