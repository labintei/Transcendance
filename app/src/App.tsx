import React, { useEffect } from 'react';
import './App.css';
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";

function App () {
  const navigate = useNavigate();
  const location = useLocation();
  let root = false;
  if (location.pathname === "/") {
    console.log(location.pathname);
    root = true;
  }

  useEffect(()=>{
  var canvas:any = document.getElementsByTagName('canvas');
  if (canvas[0])
  {
    console.log(canvas[0])
    // canvas[0].removeEventListener("webglcontextlost", null, false);
    canvas[0].addEventListener("webglcontextlost", function(event:any) {
      event.preventDefault();
      event.stopPropagation()
      console.log(event)
      console.log("target that the context is lost")
    }, false);
  }
  }, [location.pathname])

  return (
    <div className="App">
    
      {(root ? <Navigate to="matching"></Navigate> : <></>)}
   <menu>
        <li><button onClick={() => {navigate("matching")}}>Matching</button></li>
        <li><button onClick={() => {navigate("leaderboard")}}>LeaderBoard</button></li>
        <li><button onClick={() => {navigate("match-history")}}>History</button></li>
        <li><button onClick={() => {navigate("profile")}}>Profile</button></li>
        <li><button onClick={() => {navigate("login")}}>Log in/out</button></li>
        <li><button onClick={() => {navigate("game")}}>game</button></li>
        <li><button onClick={() => {navigate("chat")}}>chat</button></li>
      </menu>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
