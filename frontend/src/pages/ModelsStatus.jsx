import { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function ModelsStatus() {

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    api.getModelsStatus()
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

  }, []);

  if (loading) {
    return (
      <div style={{color:"#4a6380",padding:50}}>
        Loading model status...
      </div>
    );
  }

  if (!status) {
    return (
      <div style={{color:"#ff4d6d",padding:50}}>
        Could not load model status
      </div>
    );
  }

  return (

    <div style={{ paddingTop: 32 }}>

      <h1 style={{color:"#e0eaff"}}>Model Registry</h1>

      {/* Summary */}
      <div style={{
        marginTop:20,
        marginBottom:20,
        color:"#00d4ff"
      }}>
        Models Trained: {status.trained}/{status.total}
      </div>

      {/* Table */}
      <table style={{
        width:"100%",
        borderCollapse:"collapse",
        color:"#e0eaff"
      }}>

        <thead>
          <tr style={{color:"#4a6380"}}>
            <th>Ticker</th>
            <th>Status</th>
            <th>Model</th>
            <th>Accuracy</th>
            <th>Samples</th>
          </tr>
        </thead>

        <tbody>

          {status.models.map(m => (

            <tr key={m.ticker}>

              <td>{m.ticker}</td>

              <td style={{
                color:m.trained ? "#00ff88" : "#ff4d6d"
              }}>
                {m.trained ? "Trained" : "Pending"}
              </td>

              <td>{m.model_type || "-"}</td>

              <td>
                {m.accuracy
                  ? `${(m.accuracy*100).toFixed(1)}%`
                  : "-"
                }
              </td>

              <td>{m.train_samples || "-"}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}