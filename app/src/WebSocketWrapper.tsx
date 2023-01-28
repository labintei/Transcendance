import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

interface WebSocketWrapper {
  children: React.ReactNode;
}

const backend_url = process.env.REACT_APP_BACKEND_URL || '';
const socket = io(backend_url, { 
  autoConnect: false,
  withCredentials: true});

const defaultLogin = { 
  set: (arg: string) => {},
  value: "",
};

export const getLoginContext = React.createContext(defaultLogin);
export const getSocketContext = React.createContext(socket);

export default function WebSocketWrapper( props : WebSocketWrapper ) {
  const [login, setLogin] = useState<string>("");

  useEffect(() => {
    isLogged();
  }, []);

  useEffect(() => {
    if (login === "") {
      if (socket.connected)
        socket.disconnect();
      return ;
    }

    if (!socket.connected) {
      socket.connect();
      console.log("Websocket connected :)");

      socket.on('ping', () => {
        socket.emit('pong');
      })
    }
  }, [login]);

  function setLogged(arg : string) {
    setLogin(arg)
  }

  function isLogged() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then((rec) => {
      setLogin(rec.data.ft_login);
    }).catch(() => {
      setLogin("");
    });
  }

  return (
    <getSocketContext.Provider value={socket}>
      <getLoginContext.Provider value={{set: setLogged, value: login}}>
        { props.children }
      </getLoginContext.Provider>
    </getSocketContext.Provider>
  );
}