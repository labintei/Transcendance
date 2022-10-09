import React, { useState } from 'react';
import './App.css';
import PersonList from './component/PersonList';
import LevelList from './component/LevelList';
import MatchList from './component/MatchHistory';
import PlayerProfile from './component/PlayerProfile';
import PongGame from './Game/src/PongGame';
import { Outlet, Link, useNavigate, useParams, useLocation } from "react-router-dom";

const components = {
  matching: PersonList,
  playerprofile: PlayerProfile,
  historymatch: MatchList,
  levels: LevelList,
  default: PersonList,
  game: PongGame,
}

function App () {
  const navigate = useNavigate();
  const location = useLocation();

  console.log(location.pathname)
  if (location.pathname == '/')
    navigate("matching");
  return (
    <div className="App">
     { location.pathname != "/game" &&  <menu>
        <li><button onClick={() => {navigate("matching")}}>Matching</button></li>
        <li><button onClick={() => {navigate("leaderboard")}}>LeaderBoard</button></li>
        <li><button onClick={() => {navigate("match-history")}}>History</button></li>
        <li><button onClick={() => {navigate("profile")}}>Profile</button></li>
        <li><button onClick={() => {navigate("game")}}>game</button></li>
      </menu> }
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
