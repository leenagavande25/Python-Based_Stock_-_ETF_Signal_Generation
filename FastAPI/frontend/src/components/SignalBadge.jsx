const CONFIG = {
  BUY:  { color: "#00ff88", bg: "rgba(0,255,136,0.1)", border: "rgba(0,255,136,0.3)", icon: "▲" },
  SELL: { color: "#ff4d6d", bg: "rgba(255,77,109,0.1)", border: "rgba(255,77,109,0.3)", icon: "▼" },
  HOLD: { color: "#ffd166", bg: "rgba(255,209,102,0.1)", border: "rgba(255,209,102,0.3)", icon: "◆" },
  "N/A":{ color: "#6b8aad", bg: "rgba(107,138,173,0.1)", border: "rgba(107,138,173,0.3)", icon: "?" },
};

export default function SignalBadge({ signal, large = false }) {
  const cfg = CONFIG[signal] || CONFIG["N/A"];
  return (
    <span style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      borderRadius: 6,
      padding: large ? "6px 16px" : "3px 10px",
      fontSize: large ? 15 : 12,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ fontSize: large ? 12 : 9 }}>{cfg.icon}</span>
      {signal}
    </span>
  );
}