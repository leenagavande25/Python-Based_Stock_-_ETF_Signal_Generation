export default function Navbar({ page }) {

  return (

    <div style={{
      height: 60,
      background: "#050b18",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      marginLeft: 220
    }}>

      <div style={{
        color: "#e0eaff",
        fontSize: 14,
        letterSpacing: "0.1em"
      }}>
        {page.toUpperCase()}
      </div>

      <div style={{
        color: "#00ff88",
        fontSize: 12
      }}>
        ● NSE LIVE
      </div>

    </div>

  );
}