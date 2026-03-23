import React from "react";
import { LayoutDashboard, BarChart2, Activity, Bell, Settings, History } from "lucide-react";

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: "dashboard",  label: "Screener",    icon: LayoutDashboard },
    { id: "backtest",   label: "Backtests",   icon: Activity },
    { id: "history",    label: "History",     icon: History },
    { id: "alerts",     label: "Alert Config",icon: Bell },
    { id: "models",     label: "ML Engines",  icon: Settings },
  ];

  return (
    <div style={{
      width: 220, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-color)",
      padding: "24px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "0 8px" }}>
        <div style={{ width: 30, height: 30, background: "var(--accent-blue)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChart2 size={18} color="white" />
        </div>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
          Signal<span style={{ color: "var(--accent-blue)" }}>AI</span>
        </h2>
      </div>

      {navItems.map(item => {
        const Icon = item.icon;
        const active = currentPage === item.id || (item.id === "dashboard" && currentPage === "predictions");
        return (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            style={{
              padding: "11px 14px",
              border: "none",
              background: active ? "rgba(41,98,255,0.12)" : "transparent",
              color: active ? "var(--text-main)" : "var(--text-muted)",
              borderRadius: 7,
              display: "flex", alignItems: "center", gap: 11,
              fontWeight: active ? 600 : 400,
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.18s",
              borderLeft: active ? "3px solid var(--accent-blue)" : "3px solid transparent",
            }}
          >
            <Icon size={16} color={active ? "var(--accent-blue)" : "currentColor"} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;
