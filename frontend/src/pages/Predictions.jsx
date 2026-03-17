import { useEffect, useState } from "react";
import { api } from "../utils/api";
import SignalBadge from "../components/SignalBadge";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Predictions({ signalFilter }) {

  const [signals,setSignals] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    api.getAllSignals()
      .then(d=>{

        let data = d.signals || [];

        if(signalFilter && signalFilter !== "ALL"){
          data = data.filter(s => s.signal === signalFilter);
        }

        setSignals(data);
        setLoading(false);

      })

  },[signalFilter])

  if(loading){
    return (
      <div style={{color:"#6b8aad"}}>
        Loading predictions...
      </div>
    )
  }

  const chartData = {

    labels: signals.map(s => s.ticker),

    datasets: [

      {
        label:"Model Accuracy %",
        data: signals.map(s => (s.accuracy*100).toFixed(1)),
        backgroundColor:"#00d4ff"
      }

    ]

  }

  return(

    <div>

      <h1 style={{
        fontSize:32,
        color:"#e0eaff",
        marginBottom:30
      }}>
        {signalFilter || "All"} AI Predictions
      </h1>

      <div style={{
        background:"rgba(255,255,255,0.03)",
        padding:20,
        borderRadius:12,
        marginBottom:40
      }}>
        <Bar data={chartData}/>
      </div>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",
        gap:16
      }}>

        {signals.map((s,i)=>(

          <div key={i} style={{
            background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:12,
            padding:20
          }}>

            <h3 style={{color:"#e0eaff"}}>
              {s.ticker}
            </h3>

            <div style={{margin:"10px 0"}}>
              <SignalBadge signal={s.signal}/>
            </div>

            <div style={{fontSize:12,color:"#6b8aad"}}>
              Sector: {s.sector}
            </div>

            <div style={{
              marginTop:10,
              fontSize:14,
              color:"#00d4ff"
            }}>
              Accuracy: {(s.accuracy*100).toFixed(1)}%
            </div>

          </div>

        ))}

      </div>

    </div>

  )

}