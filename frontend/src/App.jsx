import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Backtest from "./pages/Backtest";
import Predictions from "./pages/Predictions";
import Alerts from "./pages/Alerts";
import ModelsStatus from "./pages/ModelsStatus";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function App() {

  const [page, setPage] = useState("dashboard");
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [signalFilter, setSignalFilter] = useState(null);

  const navigate = (pg, data = null) => {

    setPage(pg);

    if (pg === "stock") {
      setSelectedTicker(data);
    }

    if (pg === "predictions") {
      setSignalFilter(data);
    }

  };

  return (

    <div style={{
      background:"#0a0e1a",
      minHeight:"100vh",
      fontFamily:"DM Mono, monospace"
    }}>

      <Sidebar page={page} navigate={navigate} />

      <Navbar page={page} />

      <div style={{
        marginLeft:220,
        padding:"30px 40px"
      }}>

        {page === "dashboard" &&
          <Dashboard navigate={navigate} />
        }

        {page === "backtest" &&
          <Backtest ticker={selectedTicker || "TCS"} />
        }

        {page === "predictions" &&
          <Predictions signalFilter={signalFilter} />
        }

        {page === "alerts" &&
          <Alerts />
        }

        {page === "models" &&
          <ModelsStatus />
        }

      </div>

    </div>

  );

}