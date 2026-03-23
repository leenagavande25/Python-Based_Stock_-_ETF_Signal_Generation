import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Predictions from "./pages/Predictions";
import Backtest from "./pages/Backtest";
import ModelsStatus from "./pages/ModelsStatus";
import Alerts from "./pages/Alerts";
import History from "./pages/History";
import Sidebar from "./components/Sidebar";

function App() {
  const [currentPage, setCurrentPage]   = useState("dashboard");
  const [selectedData, setSelectedData] = useState(null);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":   return <Dashboard setSelectedData={setSelectedData} navigateTo={setCurrentPage} />;
      case "predictions": return <Predictions selectedData={selectedData} navigateTo={setCurrentPage} />;
      case "backtest":    return <Backtest />;
      case "history":     return <History />;
      case "alerts":      return <Alerts />;
      case "models":      return <ModelsStatus />;
      default:            return <Dashboard setSelectedData={setSelectedData} navigateTo={setCurrentPage} />;
    }
  };

  return (
    <div className="layout-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="main-content">{renderPage()}</div>
    </div>
  );
}

export default App;