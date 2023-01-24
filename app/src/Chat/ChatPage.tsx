import React, { useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketContext } from 'WebSocketWrapper';
// import ChannelMessage from './ChannelMessage';
// import ChannelSidebar from './ChannelSidebar';
// import MessageInput from './MessageInput';
import { Navigate } from 'react-router-dom';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {
  Avatar,
  ChatContainer,
  Conversation,
  ExpansionPanel,
  MainContainer,
  MessageList,
  Message,
  MessageInput,
  MessageSeparator,
  Sidebar
} from '@chatscope/chat-ui-kit-react';
import { hasProps } from '@react-spring/core/dist/declarations/src/helpers';

// const backend_url = process.env.REACT_APP_BACKEND_URL || '';
// const socket = io(backend_url, { withCredentials: true });

interface Message {
  time: Date;
  content: string;
  sender: { username : string };
}

interface Channel {
  status: string;
  name: string;
}

export default function Chat() {
  const [currentChannel, setCurrentChannel] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  // const [valueCreateChannel, setValueCreateChannel] = useState<string>();

  const socket = useContext(getSocketContext);

  useEffect(() => {
    if (!socket.connected)
        return ;
    socket.on('error', () => { console.log('error') });
    socket.on('connect', () => { console.log('connected') });
    socket.on('disconnect', () => { console.log('disconnected') });
    socket.on('msg', (data) => { console.log('msg', data) }); // move to Message or ChannelMessage

    socket.on('joinedList', (data) => {
      console.log("hello");
      setChannels(data)
    });

    socket.on('getMsgs', (data) => { setMessages(data)});

    socket.emit('joinedList');

    // This code will run when component unmount
    return () => {
      socket.off('error');
      socket.off('msg');
      socket.off('getChannels');
      socket.off('joinedList');
    };
  }, []);

  function renderConversations() {
    return (
      <>
        {channels.map((channel, index) => {
          const name = channel.name;
          return (
            <Conversation
              key={index}
              active={name == currentChannel}
              name={name}
              onClick={switchChannel(name)}/>
          )})}
      </>
    )
  }

  function renderMessageList() {
    console.log("renderMessageList", channels.length)
    if (channels.length === 0)
    {
      return (
        <MessageList>
          <MessageSeparator/>
          <MessageSeparator>You are not in any channels currently.</MessageSeparator>
          <MessageSeparator/>
        </MessageList>
      );
    }

    return (
      <MessageList>
        {messages.map((message, index) => {
          return (
            <Message
              key={index}
              model={{
                message: message.content,
                sentTime: message.time.getUTCDate().toString(),
                sender: message.sender.username,
                direction: "incoming",
                position: "single"
              }}
            >
            </Message>
          )
        })}
      </MessageList>
    );
  }

  function createChannel(channelName : string) {
    console.log("create channel", channelName);
    socket.emit("createChannel", {
      name: channelName,
      password: null,
      status: "Public",
    }, () => { socket.emit("joinedList")})
  }

  function sendMessage(content : string) {
    console.log(content, currentChannel);
    socket.emit("sendMsg", {
      content: content,
      channel: { name: currentChannel }
    }, () => {
      socket.emit("getMsgs", {
        channel: { name: currentChannel },
        from: null,
        count: 10
      })
    })
  }

  const switchChannel = (name: string) => (e: any) => {
    console.log(name, e);
    setCurrentChannel(name);
    socket.emit('getMsgs', {
      channel: { name: name },
      from: null,
      count: 10
    });
  }

  return (
    <div style={{
      height: "600px",
      position: "relative",
      textAlign: "initial"
    }}>
      { !socket.connected ? <Navigate to="/login"></Navigate> : <></> }
      <MainContainer>
        <Sidebar position="left" scrollable={false}>
          <ExpansionPanel title="Create Channel" open={false}>
            <MessageInput
              attachButton={false}
              sendButton={false}
              onSend={createChannel}
              placeholder="Type channel name here ..."/>
          </ExpansionPanel>
        {renderConversations()}
        </Sidebar>
        <Sidebar position="right" scrollable={false}>
          <p>This is a sidebar.</p>
        </Sidebar>
        <ChatContainer>
          {renderMessageList()}
          <MessageInput
            attachButton={false}
            onSend={sendMessage}
            placeholder="Type message here ..." />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
