import React, { useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketContext } from 'WebSocketWrapper';
import ChannelMessage from './ChannelMessage';
import ChannelSidebar from './ChannelSidebar';
import MessageInput from './MessageInput';
import { Navigate } from 'react-router-dom';

// const backend_url = process.env.REACT_APP_BACKEND_URL || '';
// const socket = io(backend_url, { withCredentials: true });

export default function Chat() {
  const [channelKey, setChannelKey] = useState(0);

  const socket = useContext(getSocketContext);

  useEffect(() => {
    if (!socket.connected)
        return ;
    socket.on('error', () => { console.log('error') });
    socket.on('connect', () => { console.log('connected') });
    socket.on('disconnect', () => { console.log('disconnected') });
    socket.on('msg', (data) => { console.log('msg', data) }); // move to Message or ChannelMessage

    // This code will run when component unmount
    return () => {
      socket.off('error');
      socket.off('msg');
      socket.off('getChannels');
    };
  }, []);

  const loadMessageChannel = (key : number) => (event : any) => {
    event.preventDefault();

    const text = event.target.textContent;
    console.log('loadMessageChannel', text, key);
    socket.emit('getMsgs', {
      channel: { id: key },
      from: null,
      count: 10
    });
    setChannelKey(key);
  }

  return (
    <>
      { !socket.connected ? <Navigate to="/login"></Navigate> : <></>}
      <div className="chat">
        <div className="header"><h1>Chat</h1></div>
        <ChannelSidebar
          socket={socket}
          onChannelClick={loadMessageChannel}
        />
        <ChannelMessage
          socket={socket}
          channelKey={channelKey}
        />
        <MessageInput
          socket={socket}
          channelKey={channelKey}
        />
      </div>
    </>
  );
}
