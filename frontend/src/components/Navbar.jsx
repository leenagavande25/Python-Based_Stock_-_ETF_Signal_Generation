export default function Navbar({ page, navigate }) {
  const links = [
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <nav style={{
      background: "rgba(10,14,26,0.95)",
      borderBottom: "1px solid #1e2d4a",
      backdropFilter: "blur(12px)",
      position: "sticky", top: 0, zIndex: 100,
      padding: "0 32px",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        display: "flex", alignItems: "center",
        height: 64, gap: 32,
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate("dashboard")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
        >
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #00d4ff, #0066ff)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>📈</div>
          <span style={{
            fontSize: 16, fontWeight: 700, letterSpacing: "0.08em",
            color: "#e0eaff", textTransform: "uppercase",
          }}>
            SignalAI <span style={{ color: "#00d4ff" }}>India</span>
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Nav links */}
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => navigate(l.id)}
            style={{
              background: "none", border: "none",
              cursor: "pointer",
              fontSize: 13, letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: page === l.id ? "#00d4ff" : "#6b8aad",
              borderBottom: page === l.id ? "2px solid #00d4ff" : "2px solid transparent",
              padding: "4px 0",
              transition: "all 0.2s",
            }}
          >{l.label}</button>
        ))}

        {/* Live badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(0,212,255,0.08)",
          border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: 20, padding: "4px 12px",
          fontSize: 11, color: "#00d4ff", letterSpacing: "0.1em",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#00ff88",
            boxShadow: "0 0 6px #00ff88",
            animation: "pulse 2s infinite",
            display: "inline-block",
          }} />
          NSE LIVE
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </nav>
  );
}