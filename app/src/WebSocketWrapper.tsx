import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface WebSocketWrapper {
  children: React.ReactNode;
}

export const getLoginContext = React.createContext((arg : boolean) => {});
export const getSocketContext = React.createContext<Socket | undefined>(undefined);

export default function WebSocketWrapper( props : WebSocketWrapper ) {
  const [login, setLogin] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket>();

  const backend_url = process.env.REACT_APP_BACKEND_URL || '';


  useEffect(() => {
    if (login === false) {
      isLogged();
      return ;
    }

    console.log("trying to connect");
    setSocket(io(backend_url, { withCredentials: true }));
    console.log("connected :)");
  }, [login]);

  function testWrapper() {
    console.log("hello from wrapper");
  }

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
    <getLoginContext.Provider value={setLogged}>
      <getSocketContext.Provider value={socket}>
        { props.children }
      </getSocketContext.Provider>
    </getLoginContext.Provider>
  );
}