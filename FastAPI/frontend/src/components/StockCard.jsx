import SignalBadge from "./SignalBadge";

export default function StockCard({stock,onClick}){

return(

<div
onClick={onClick}
style={{
border:"1px solid rgba(255,255,255,0.08)",
borderRadius:12,
padding:16,
cursor:"pointer",
background:"rgba(255,255,255,0.02)"
}}>

<h3 style={{color:"#e0eaff"}}>{stock.ticker}</h3>

<p style={{color:"#4a6380",fontSize:12}}>
{stock.sector}
</p>

<SignalBadge signal={stock.signal}/>

<p style={{color:"#e0eaff",marginTop:6}}>
₹{stock.latest_close}
</p>

</div>

)

}