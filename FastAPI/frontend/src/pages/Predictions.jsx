import React from 'react';
import useSWR from 'swr';
import { BASE } from '../utils/api';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const fetcher = url => fetch(url).then(r => r.json());

const Predictions = ({ selectedData, navigateTo }) => {
  if (!selectedData) {
    return (
      <div className="page-container" style={{ textAlign: "center", marginTop: "50px" }}>
        <h3 style={{ marginBottom: "20px", color: "var(--text-muted)" }}>No active symbol selected</h3>
        <button className="btn" onClick={() => navigateTo("dashboard")}>Return to Screener</button>
      </div>
    );
  }

  // Fetch {dates, prices} from the fixed backend endpoint
  const { data: history, isLoading, error: chartError } = useSWR(
    `${BASE}/api/stock/${selectedData.yf_symbol}?days=60`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Validate data before building Chart.js config
  const hasPrices = history?.prices?.length > 0 && history?.dates?.length > 0;
  const prices    = hasPrices ? history.prices : [];
  const dates     = hasPrices ? history.dates  : [];
  const minPrice  = hasPrices ? Math.min(...prices) * 0.995 : 0;
  const maxPrice  = hasPrices ? Math.max(...prices) * 1.005 : 100;

  const lineData = {
    labels: dates,
    datasets: [
      {
        label: `${selectedData.ticker} Closing Price (₹)`,
        data: prices,
        borderColor: "rgba(41, 98, 255, 1)",
        backgroundColor: "rgba(41, 98, 255, 0.12)",
        tension: 0.35,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#d1d4dc", font: { family: "Inter", size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ₹${ctx.parsed.y.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#787b86", font: { family: "Inter", size: 11 }, maxTicksLimit: 8 },
        grid: { color: "#2a2e39" },
      },
      y: {
        min: minPrice,
        max: maxPrice,
        ticks: {
          color: "#787b86",
          font: { family: "Inter", size: 11 },
          callback: v => `₹${v.toLocaleString("en-IN")}`,
        },
        grid: { color: "#2a2e39" },
      },
    },
  };

  // Doughnut probabilities
  const pieData = {
    labels: ["BUY", "HOLD", "SELL"],
    datasets: [{
      data: [
        (selectedData.probabilities?.BUY  || 0) * 100,
        (selectedData.probabilities?.HOLD || 0) * 100,
        (selectedData.probabilities?.SELL || 0) * 100,
      ],
      backgroundColor: ["#00b894", "#f1c40f", "#ff5252"],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const pieOptions = {
    cutout: "75%",
    plugins: {
      legend: { position: "bottom", labels: { color: "#d1d4dc", font: { family: "Inter" } } },
    },
  };

  const signalClass = `signal-${selectedData.signal?.toLowerCase() || "hold"}`;

  return (
    <div className="page-container">
      <button className="btn" onClick={() => navigateTo("dashboard")} style={{ marginBottom: 20 }}>
        ← Back to Screener
      </button>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "stretch" }}>

        {/* Left: Signal card */}
        <div className="card" style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: 4 }}>{selectedData.ticker}</h2>
          <div style={{ fontSize: "1rem", color: "var(--text-muted)", marginBottom: 20 }}>
            Last Close: <strong style={{ color: "var(--text-main)" }}>₹{selectedData.price?.toFixed(2)}</strong>
          </div>

          <div className={signalClass} style={{ fontSize: "2.8rem", fontWeight: 800 }}>
            {selectedData.confidence || selectedData.signal}
          </div>
          <div style={{ fontSize: "1.2rem", marginTop: 4, color: "var(--text-main)" }}>
            Momentum {selectedData.trend}
          </div>

          <div style={{ marginTop: 24, padding: 14, background: "var(--bg-dark)", border: "1px solid var(--border-color)", borderRadius: 8, width: "100%", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Model Accuracy</span>
              <strong style={{ color: "var(--accent-blue)" }}>
                {selectedData.test_accuracy ? `${(selectedData.test_accuracy * 100).toFixed(1)}%` : "N/A"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>ML Engine</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{selectedData.model_type || "—"}</span>
            </div>
          </div>
        </div>

        {/* Middle: Probability doughnut */}
        <div className="card" style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h3 style={{ marginBottom: 18, color: "var(--text-muted)", fontWeight: 500 }}>Signal Probability</h3>
          <div style={{ width: 210, height: 210 }}>
            <Doughnut data={pieData} options={pieOptions} />
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 16, fontSize: "0.82rem" }}>
            <span style={{ color: "var(--signal-buy)" }}>● BUY {((selectedData.probabilities?.BUY || 0) * 100).toFixed(0)}%</span>
            <span style={{ color: "var(--signal-hold)" }}>● HOLD {((selectedData.probabilities?.HOLD || 0) * 100).toFixed(0)}%</span>
            <span style={{ color: "var(--signal-sell)" }}>● SELL {((selectedData.probabilities?.SELL || 0) * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Right: 60-day price chart */}
        <div className="card" style={{ flex: "2 1 460px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ marginBottom: 16, color: "var(--text-muted)", fontWeight: 500 }}>
            60-Day Price Trajectory
          </h3>

          {isLoading && (
            <div className="skeleton" style={{ flexGrow: 1, minHeight: 280 }} />
          )}

          {!isLoading && chartError && (
            <div style={{ color: "var(--signal-sell)", padding: 20, textAlign: "center" }}>
              ⚠️ Failed to load chart data. Check backend connectivity.
            </div>
          )}

          {!isLoading && !chartError && !hasPrices && (
            <div style={{ color: "var(--text-muted)", padding: 20, textAlign: "center" }}>
              No price data available for {selectedData.ticker}.
            </div>
          )}

          {!isLoading && hasPrices && (
            <div style={{ flexGrow: 1, minHeight: 280 }}>
              <Line data={lineData} options={lineOptions} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Predictions;