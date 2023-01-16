import React from 'react';
import './App.css';
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";

import {soc} from './component/LoginPage'


export const socket = soc; 
export const user = {};
// 
/*
export const soc = io(secu_url, {
  auth: {
    token: "123"
  },
})
*/
// https://socket.io/fr/docs/v4/client-options/
// options authentification auth/query/forceNew/multiplex/...
// peut creer un manager ... pas utile n seul client


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
