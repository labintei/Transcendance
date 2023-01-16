import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface WebSocketWrapper {
  children: React.ReactNode;
}

const backend_url = process.env.REACT_APP_BACKEND_URL || '';
const socket = io(backend_url, { 
  autoConnect: false,
  withCredentials: true});

const defaultLogin = { 
  set: (arg: boolean) => {},
  status: false,
};

export const getLoginContext = React.createContext(defaultLogin);
export const getSocketContext = React.createContext(socket);

export default function WebSocketWrapper( props : WebSocketWrapper ) {
  const [login, setLogin] = useState<boolean>(false);

  useEffect(() => {
    isLogged();
  }, []);

  useEffect(() => {
    if (login === false) {
      if (socket.connected)
        socket.disconnect();
      return ;
    }

    if (!socket.connected) {
      socket.connect();
      console.log("Websocket connected :)");

      socket.on('ping', () => {
        socket.emit('pong');
        console.count('pong');
      })
    }
  }, [login]);

  function setLogged(arg : boolean) {
    setLogin(arg)
  }

  function isLogged() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(() => {
      setLogin(true);
    }).catch(() => {
      setLogin(false);
    });
  }

  return (
    <getSocketContext.Provider value={socket}>
      <getLoginContext.Provider value={{set: setLogged, status: login}}>
        { props.children }
      </getLoginContext.Provider>
    </getSocketContext.Provider>
  );
}