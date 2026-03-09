
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const navigate=useNavigate();

  const handleSubmit=(e)=>{
    e.preventDefault();
    if(email && password){
      localStorage.setItem("auth","true");
      navigate("/dashboard");
    }
  }

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>
      <form onSubmit={handleSubmit} style={{padding:30,border:"1px solid #ddd",borderRadius:8,width:320}}>
        <h2 style={{textAlign:"center"}}>Register</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{width:"100%",padding:10,marginTop:10}}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{width:"100%",padding:10,marginTop:10}}
        />

        <button style={{width:"100%",padding:10,marginTop:15}}>
          Register
        </button>

        <p style={{marginTop:10}}>
          Already have account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
