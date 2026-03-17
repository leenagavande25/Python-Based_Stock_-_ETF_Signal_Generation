import { useState, useEffect } from "react";
import { api } from "../utils/api";
import SignalBadge from "../components/SignalBadge";

const SECTOR_COLORS = {
  "Information Technology": "#00d4ff",
  "Banking & Finance": "#a78bfa",
  "Energy / Conglomerate": "#fb923c",
  "FMCG": "#4ade80",
  "FMCG / Conglomerate": "#86efac",
  "Telecommunications": "#f472b6",
};

export default function Dashboard({ navigate }) {

  const [signals,setSignals] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  useEffect(()=>{

    api.getAllSignals()
      .then(d=>{
        setSignals(d.signals || []);
        setLoading(false);
      })
      .catch(()=>{
        setError("Backend offline. Start FastAPI server.");
        setLoading(false);
      })

  },[])

  const counts = {BUY:0,HOLD:0,SELL:0};

  signals.forEach(s=>{
    if(counts[s.signal] !== undefined){
      counts[s.signal]++
    }
  })

  return(

    <div style={{paddingTop:36}}>

      {/* Header */}

      <div style={{marginBottom:32}}>

        <div style={{
          fontSize:11,
          color:"#00d4ff",
          letterSpacing:"0.2em",
          textTransform:"uppercase",
          marginBottom:8
        }}>
          AI-POWERED · NSE TOP 10
        </div>

        <h1 style={{
          fontSize:36,
          fontWeight:700,
          color:"#e0eaff",
          margin:0
        }}>
          Signal Dashboard
        </h1>

        <p style={{
          color:"#4a6380",
          marginTop:8,
          fontSize:13
        }}>
          ML-generated buy/sell/hold signals
        </p>

      </div>


      {/* Summary Cards */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(3,1fr)",
        gap:16,
        marginBottom:32
      }}>

        {[
          {label:"BUY Signals",count:counts.BUY,color:"#00ff88",icon:"▲",signal:"BUY"},
          {label:"HOLD Signals",count:counts.HOLD,color:"#ffd166",icon:"◆",signal:"HOLD"},
          {label:"SELL Signals",count:counts.SELL,color:"#ff4d6d",icon:"▼",signal:"SELL"}
        ].map(c=>(
          
          <div
          key={c.label}

          onClick={()=>navigate("predictions",c.signal)}

          style={{
            background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:12,
            padding:"20px 24px",
            display:"flex",
            alignItems:"center",
            gap:16,
            cursor:"pointer"
          }}>

            <div style={{
              width:44,
              height:44,
              borderRadius:10,
              background:`${c.color}15`,
              border:`1px solid ${c.color}30`,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              fontSize:20,
              color:c.color
            }}>
              {c.icon}
            </div>

            <div>

              <div style={{
                fontSize:28,
                fontWeight:700,
                color:c.color
              }}>
                {c.count}
              </div>

              <div style={{
                fontSize:11,
                color:"#4a6380",
                letterSpacing:"0.1em",
                textTransform:"uppercase"
              }}>
                {c.label}
              </div>

            </div>

          </div>

        ))}

      </div>


      {/* Loading */}

      {loading && (

        <div style={{
          textAlign:"center",
          color:"#4a6380",
          padding:80
        }}>
          Loading signals...
        </div>

      )}


      {/* Error */}

      {error && (

        <div style={{
          background:"rgba(255,77,109,0.08)",
          border:"1px solid rgba(255,77,109,0.2)",
          borderRadius:12,
          padding:24,
          color:"#ff4d6d"
        }}>
          {error}
        </div>

      )}


      {/* Stock Cards */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",
        gap:16
      }}>

        {signals.map(s=>(
          <StockCard key={s.ticker} stock={s} navigate={navigate}/>
        ))}

      </div>

    </div>

  )
}



function StockCard({stock,navigate}){

  const [hover,setHover] = useState(false)

  const sectorColor = SECTOR_COLORS[stock.sector] || "#00d4ff"

  const buy = stock.probabilities?.BUY ?? 0
  const hold = stock.probabilities?.HOLD ?? 0
  const sell = stock.probabilities?.SELL ?? 0


  return(

    <div

    onMouseEnter={()=>setHover(true)}
    onMouseLeave={()=>setHover(false)}

    onClick={()=>navigate("stock",stock.ticker)}

    style={{
      background:hover ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
      border:"1px solid rgba(255,255,255,0.06)",
      borderRadius:14,
      padding:20,
      cursor:"pointer",
      transition:"all 0.2s"
    }}>

      <div style={{
        display:"flex",
        justifyContent:"space-between",
        marginBottom:14
      }}>

        <div>

          <div style={{
            fontSize:18,
            fontWeight:700,
            color:"#e0eaff"
          }}>
            {stock.ticker}
          </div>

          <div style={{
            fontSize:10,
            color:sectorColor
          }}>
            {stock.sector}
          </div>

        </div>

        <SignalBadge signal={stock.signal}/>

      </div>


      {stock.latest_close && (

        <div style={{marginBottom:14}}>

          <span style={{
            fontSize:22,
            fontWeight:700,
            color:"#e0eaff"
          }}>
            ₹{stock.latest_close?.toLocaleString("en-IN")}
          </span>

        </div>

      )}


      {stock.probabilities && (

        <div style={{display:"flex",flexDirection:"column",gap:6}}>

          {[
            {label:"BUY",val:buy,color:"#00ff88"},
            {label:"HOLD",val:hold,color:"#ffd166"},
            {label:"SELL",val:sell,color:"#ff4d6d"}
          ].map(p=>(

            <div key={p.label} style={{display:"flex",gap:8}}>

              <span style={{
                width:28,
                fontSize:9,
                color:p.color
              }}>
                {p.label}
              </span>

              <div style={{
                flex:1,
                height:4,
                background:"rgba(255,255,255,0.05)"
              }}>

                <div style={{
                  width:`${(p.val*100).toFixed(1)}%`,
                  height:"100%",
                  background:p.color
                }}/>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  )

}