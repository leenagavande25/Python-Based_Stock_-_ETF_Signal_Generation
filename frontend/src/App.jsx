import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import StockDetail from "./pages/StockDetail";
import Navbar from "./components/Navbar";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedTicker, setSelectedTicker] = useState(null);

  const navigate = (pg, ticker = null) => {
    setPage(pg);
    if (ticker) setSelectedTicker(ticker);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", fontFamily: "'DM Mono', monospace" }}>
      <Navbar page={page} navigate={navigate} />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 48px" }}>
        {page === "dashboard"  && <Dashboard navigate={navigate} />}
        {page === "stock"      && <StockDetail ticker={selectedTicker} navigate={navigate} />}
        {page === "backtest"   && <Backtest ticker={selectedTicker} />}
        {page === "models"     && <ModelsStatus />}
      </main>
    </div>
  );
}