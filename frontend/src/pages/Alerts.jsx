import {useEffect,useState} from "react"
import {api} from "../utils/api"
import SignalBadge from "../components/SignalBadge"

export default function Alerts(){

const [alerts,setAlerts] = useState([])

useEffect(()=>{

api.getAllSignals().then(d=>{

const a = (d.signals || []).map(s=>({

ticker:s.ticker,
signal:s.signal,
time:new Date().toLocaleTimeString()

}))

setAlerts(a)

})

},[])

return(

<div style={{paddingTop:32}}>

<h1 style={{
fontSize:32,
color:"#e0eaff",
marginBottom:20
}}>
Trading Alerts
</h1>

<div style={{
overflowX:"auto"
}}>

<table style={{
width:"100%",
borderCollapse:"collapse"
}}>

<thead>

<tr style={{color:"#6b8aad",fontSize:12}}>

<th style={{textAlign:"left",padding:10}}>Ticker</th>
<th style={{textAlign:"left",padding:10}}>Signal</th>
<th style={{textAlign:"left",padding:10}}>Generated</th>

</tr>

</thead>

<tbody>

{alerts.map((a,i)=>(

<tr key={i} style={{
borderTop:"1px solid rgba(255,255,255,0.05)"
}}>

<td style={{padding:12,color:"#e0eaff"}}>
{a.ticker}
</td>

<td style={{padding:12}}>
<SignalBadge signal={a.signal}/>
</td>

<td style={{padding:12,color:"#6b8aad"}}>
{a.time}
</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}