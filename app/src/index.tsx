import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import PersonList from './component/PersonList';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import PlayerProfile from './component/PlayerProfile';
import MatchList from './component/MatchHistory';
import LevelList from './component/LevelList';
import PongGame from './Game/src/PongGame';
import LoginPage from 'component/LoginPage';
import Livematch from 'component/Livematch/Livematch';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "matching",
        element: <PersonList />,
      },
      {
        path: "leaderboard",
        element: <LevelList />,
      },
      {
        path: "match-history",
        element: <MatchList />,
      },
      {
        path: "profile",
        element: <PlayerProfile />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "game",
        element: <PongGame />,
      },
      {
          path: "lives",
          element: <Livematch />
      },
    ],
  },
]);

root.render(
  // <React.StrictMode>
    <RouterProvider router={router} />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
