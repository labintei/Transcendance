import React from 'react';
import './App.css';
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";

// test
import { io, Socket } from "socket.io-client";

const secu_url = process.env.REACT_APP_BACKEND_URL || '';
console.log('once');
export const socket = io(secu_url);


function App () {
  const navigate = useNavigate();
  const location = useLocation();
  let root = false;
  if (location.pathname === "/") {
    console.log(location.pathname);
    root = true;
  }

  return (
    <div className="App">
    
      {(root ? <Navigate to="matching"></Navigate> : <></>)}
     { location.pathname !== "/game" &&  <menu>
        <li><button onClick={() => {navigate("matching")}}>Matching</button></li>
        <li><button onClick={() => {navigate("leaderboard")}}>LeaderBoard</button></li>
        <li><button onClick={() => {navigate("match-history")}}>History</button></li>
        <li><button onClick={() => {navigate("profile")}}>Profile</button></li>
        <li><button onClick={() => {navigate("login")}}>Log in/out</button></li>
        <li><button onClick={() => {navigate("game")}}>game</button></li>
      </menu> }
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
