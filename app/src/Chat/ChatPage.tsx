import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import ChannelMessage from './ChannelMessage';
import ChannelSidebar from './ChannelSidebar';
import MessageInput from './MessageInput';

function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);

  const [channelKey, setChannelKey] = useState(0);

  useEffect(() => {
    const socket = io('localhost:3000');
    setSocket(socket);

    socket.on('connect', () => {
      console.log('connected');
    });
  
    socket.on('disconnect', () => {
      console.log('disconnected');
    });
  
    socket.on('message', (data) => {
      console.log('message', data);
    });

    // This code will run when component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  function loadChannel() {
    if (!socket) return;
    socket.emit('getChannels'); // determine how to get user's name
  };

  const loadMessageChannel = (key : number) => (event : any) => {
    event.preventDefault();

    const text = event.target.textContent;
    console.log('loadMessageChannel', text, key);
    setChannelKey(key);
  }

  return (
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
  );
}

export default Chat;