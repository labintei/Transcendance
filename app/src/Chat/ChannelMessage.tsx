import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import './Chat.css';

interface ChannelMessageProps {
  socket: Socket | null;
  channelKey: number;
}

function ChannelMessage(props: ChannelMessageProps) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!props.socket) return;
    props.socket.on('msgs', (data) => {
      setMessages(data.reverse());
      console.log('debug', data);
    });
    console.log('UseEffect ChannelMessage');
    props.socket.emit('getMsgs', {
      channel: { id: props.channelKey },
      from: null,
      count: 10
    });
  }, []);

  return (
    <div className="messages">
      <p>Chat Message from Channel {props.channelKey}</p>
      {messages.map((message: any, index: number) => (
        <div key={index} className="message">
          [{message.time.toString()}] {message.sender.username} : {message.content}
        </div>
      ))}
    </div>
  );
}

export default ChannelMessage;