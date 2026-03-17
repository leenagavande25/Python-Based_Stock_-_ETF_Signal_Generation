import { useState } from "react";

const items = [
{ id: "dashboard", label: "Dashboard", icon: "📊" },
{ id: "predictions", label: "Predictions", icon: "🤖" },
{ id: "backtest", label: "Backtesting", icon: "📈" },
{ id: "alerts", label: "Alerts", icon: "🔔" },
{ id: "models", label: "Models Status", icon: "🧠" }
];

export default function Sidebar({ page, navigate }) {

return (
<div
style={{
width: 220,
background: "#050b18",
borderRight: "1px solid rgba(255,255,255,0.05)",
padding: "20px 12px",
height: "100vh",
position: "fixed",
left: 0,
top: 0
}}
>

```
  {/* Logo */}
  <div
    style={{
      fontSize: 18,
      fontWeight: 700,
      color: "#00d4ff",
      marginBottom: 30,
      paddingLeft: 10
    }}
  >
    SIGNALAI INDIA
  </div>

  {/* Navigation Menu */}
  {items.map((item) => (
    <div
      key={item.id}
      onClick={() => navigate(item.id)}
      style={{
        padding: "12px 14px",
        borderRadius: 8,
        marginBottom: 6,
        cursor: "pointer",
        display: "flex",
        gap: 10,
        alignItems: "center",
        fontSize: 13,
        color: page === item.id ? "#00d4ff" : "#6b8aad",
        background:
          page === item.id
            ? "rgba(0,212,255,0.08)"
            : "transparent",
        transition: "all 0.2s"
      }}
    >
      <span>{item.icon}</span>
      {item.label}
    </div>
  ))}

</div>

);
}
