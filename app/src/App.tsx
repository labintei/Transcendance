import React from 'react';
import './App.css';
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import World from 'Game/src/World/World';

function App () {
  const navigate = useNavigate();
  const location = useLocation();
  let root = false;
  if (location.pathname === "/") {
    root = true;
  }

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
        <World/>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
