import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Message } from './Message';
import './Chat.css';

interface ChannelMessageProps {
  socket: Socket | null;
  channelKey: number;
}

function ChannelMessage(props: ChannelMessageProps) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!props.socket) return;
    props.socket.on('loadMessages', (data) => {
      setMessages(data);
    });
    console.log('UseEffect ChannelMessage');
    props.socket.emit('loadMessages', props.channelKey);
  }, [props.channelKey]);

  return (
    <div className="messages">
      <p>Chat Message from Channel {props.channelKey}</p>
      {messages.map((message: Message, index: number) => (
        <div key={index} className="message">
          [{message.time.toString()}] {message.sender} : {message.content}
        </div>
      ))}
    </div>
  );
}

export default ChannelMessage;