import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import ChannelMessage from './ChannelMessage';
import ChannelSidebar from './ChannelSidebar';
import MessageInput from './MessageInput';

const backend_url = process.env.REACT_APP_BACKEND_URL || '';
const socket = io(backend_url, { withCredentials: true });

export default function Chat() {
  const [channelKey, setChannelKey] = useState(0);

  useEffect(() => {
    socket.on('ping', () => { socket.emit('pong') });
    socket.on('error', () => { console.log('error') });
    socket.on('connect', () => { console.log('connected') });
    socket.on('disconnect', () => { console.log('disconnected') });
    socket.on('msg', (data) => { console.log('msg', data) }); // move to Message or ChannelMessage
    // socket.on('getChannels', (data) => { console.log('channels :', data)}); // move to ChannelSidebar

    // This code will run when component unmount
    // need to remove
    return () => {
      socket.off('ping');
      socket.off('error');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('msg');
      socket.off('getChannels');
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
    socket.emit('getMsgs', {
      channel: { id: key },
      from: null,
      count: 10
    });
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
