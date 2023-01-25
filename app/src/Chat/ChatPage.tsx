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
  Sidebar,
  ConversationHeader,
  Button,
  AddUserButton
} from '@chatscope/chat-ui-kit-react';
import { hasProps } from '@react-spring/core/dist/declarations/src/helpers';

import avatar_temp from './logo192.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faUserSlash } from '@fortawesome/free-solid-svg-icons';

// const backend_url = process.env.REACT_APP_BACKEND_URL || '';
// const socket = io(backend_url, { withCredentials: true });

interface Message {
  time: Date;
  content: string;
  sender: { username : string };
}

interface User {

}

interface Channel {
  id: number;
  status: string;
  password: string;
  name: string;
  users: User[];
  messages: Message[];
}

const temp_msg : Message[] = [
  {time: new Date(), content: "Hello World this is a test", sender: {username: "Bob"}},
  {time: new Date(), content: "Hello World this is another test", sender: {username: "Bob"}},
  {time: new Date(), content: "Hello World this is still a test", sender: {username: "Bob"}},
];

const empty_chan = {id: 0, status: "", name: ""} as Channel;

export default function Chat() {
  const [currentChannel, setCurrentChannel] = useState<Channel>(empty_chan);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [invitedChannels, setInvitedChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>(temp_msg);
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

  function RenderConversations() {
    const switchChannel = (channel: Channel) => (e: any) => {
      setCurrentChannel(channel);
      socket.emit('getMsgs', {
        channel: { id: channel.id },
        from: null,
        count: 10
      });
    }

    return (
      <>
        {channels.map((channel, index) => {
          return (
            <Conversation
              key={index}
              active={channel.id === currentChannel.id}
              name={channel.name}
              onClick={switchChannel(channel)}/>
          )})}
      </>
    )
  }

  function RenderInvitedConversations() {
    const joinInvited = (channel: Channel) => (e: any) => {
      // socket.emit('')

    }

    return (
      <>
        {/* {channels.map((channel, index) => {
          return (
            <Conversation
              key={index}
              name={channel.name}
              onClick={joinInvited(channel)}/>
          )})} */}
      </>
    )
  }

  function RenderChatContainer() {
    console.log("renderChatContainer", channels.length)
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
      <ChatContainer>
        <ConversationHeader>
          <Avatar src={avatar_temp} name={currentChannel.name} />
          <ConversationHeader.Content
            userName={currentChannel.name}
            info="I'm blue dabudidabuda"/>
          <ConversationHeader.Actions>
            <AddUserButton title="Add as a friend"/>
            <Button style={{fontSize: "1.4em"}} icon={<FontAwesomeIcon icon={faUserSlash}/>}/>
            <Button style={{fontSize: "1.4em"}} icon={<FontAwesomeIcon icon={faArrowRightFromBracket}/>}/>
          </ConversationHeader.Actions>
        </ConversationHeader>

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
                // avatarPosition="tl"
              >
                <Message.Header sender={message.sender.username} />
                <Avatar src={avatar_temp} />
              </Message>
            )
          })}
        </MessageList>

        <MessageInput
            attachButton={false}
            onSend={sendMessage}
            placeholder="Type message here ..." />
      </ChatContainer>
    );
  }

  function RenderCreateChannel() {
    const [check, setCheck] = useState({password: false, private: false});
    let channelName: HTMLInputElement | null = null;
    let password: HTMLInputElement | null = null;

    function onSubmit(e : any) {
      e.preventDefault();

      const new_chan : Channel = {
        status: "Public",
        name: channelName!.value,
      } as Channel;

      if (check.password === true) {
        new_chan.status = "Protected";
        new_chan.password = password!.value;
      }

      if (check.private === true) {
        new_chan.status = "Private";
      }

      socket.emit('createChannel', new_chan, () => {
        socket.emit('joinedList');
      });
    }

    return (
      <form
        onSubmit={onSubmit}
      >
        <input
          type="input"
          placeholder="Channel name"
          ref={node => channelName = node}
          required
        />

      <input type="checkbox" checked={check.password}
        onChange={() => {setCheck({password: !check.password, private: false})
        }} />
        Password ?
      {
        check.password === false ? <></> :
        <input
          type="input"
          placeholder="Password"
          ref={node => password = node}
          required
        />
      }

      <input type="checkbox" checked={check.private}
        onChange={() => {setCheck({password: false, private: !check.private})
      }} />
        Private
      <Button>Create</Button>
      </form>
    );
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

  const test = () => (e: any) => {
    console.log("a", e);
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
          <ExpansionPanel title="Create Channel">
            <RenderCreateChannel />
          </ExpansionPanel>
          <ExpansionPanel title="Conversations list" open={true}>
            <RenderConversations />
          </ExpansionPanel>
          <ExpansionPanel title="Invited conversations list">
            <RenderInvitedConversations/>
          </ExpansionPanel>
        </Sidebar>
          <RenderChatContainer/>
      </MainContainer>
    </div>
  );
}
