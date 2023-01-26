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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { a } from '@react-spring/three';

const avatar_temp = "logo192.png";

const avatar_temp = "logo192.png";

// const backend_url = process.env.REACT_APP_BACKEND_URL || '';
// const socket = io(backend_url, { withCredentials: true });

interface Message {
  time: Date;
  content: string;
  sender: User;
}

interface User {
  ft_login: string;
  username: string;
  status: string;
  avatarURL: string;
  level: number;
  xp: number;
  victories: number;
  defeats: number;
  draws: number;
  rank: number;
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
  {time: new Date(), content: "Hello World this is a test", sender: {ft_login: "ft_bob", username: "Bob"} as User},
  {time: new Date(), content: "Hello World this is another test", sender: {ft_login: "ft_bob", username: "Bob"} as User},
  {time: new Date(), content: "Hello World this is still a test", sender: {ft_login: "ft_bob", username: "Bob"} as User},
];

const empty_chan = {id: 0, status: "", name: "", messages: temp_msg} as Channel;

export default function Chat() {
  const [currentChannel, setCurrentChannel] = useState<Channel>(empty_chan);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [invitedChannels, setInvitedChannels] = useState<Channel[]>([]);
  const [profilSidebar, setProfilSidebar] = useState<string>("");
  const [publicChannels, setPublicChannels] = useState<Channel[]>([]);

  const socket = useContext(getSocketContext);

  useEffect(() => {
    if (!socket.connected)
        return ;
    socket.on('error', () => { console.log('error') });
    socket.on('connect', () => { console.log('connected') });
    socket.on('disconnect', () => { console.log('disconnected') });
    socket.on('msgs', (data) => { console.log('message', data) }); // move to Message or ChannelMessage

    socket.on('joinedList', (data) => {
      console.log("[WS] joinedList");
      setChannels(data);
      if (data.length !== 0) {
        socket.emit('getChannel', data[0], (newCurrentChannel : Channel) => {
          setCurrentChannel(newCurrentChannel);
        })}
      socket.emit('publicList');
    });

    // socket.on('joinChannel', (channel : Channel) => {
    //   socket.emit('joinedList');
    //   socket.emit('getChannel', channel, (data : Channel) => {setCurrentChannel(channel)});
    // });

    socket.emit('joinedList');
    // This code will run when component unmount
    return () => {
      socket.off('message');
      socket.off('joinedList');
    };
  }, []);

  function RenderConversations() {
    const switchChannel = (channel: Channel) => (e: any) => {
      socket.emit('getChannel', channel, (data: Channel) => {
        setCurrentChannel(data);
      });
    };

      // socket.emit('getChannel', channel, (data : Channel) => {
      //   setCurrentChannel(data);
      //   let updateChannels = [...channels];
      //   let index = updateChannels.findIndex((i) => i.id === data.id);
      //   updateChannels[index] = data;
      //   setChannels(updateChannels);
      // })}

      // console.log(channels);
      // console.log(currentChannel);

    return (
      <ExpansionPanel title="Conversations list" open={true}>
        {channels.map((channel, index) => {
          return (
            <Conversation
              key={index}
              active={channel.id === currentChannel.id}
              name={channel.name}
              onClick={switchChannel(channel)}/>
          )})}
      </ExpansionPanel>
    )
  }

  function RenderPublicConversations() {
    useEffect(() => {
      socket.on('publicList', (chans : Channel[]) => {
        let newPublicList : Channel[] = [];
        console.log("[DEBUG]: channels:", channels);
        chans.filter((x : Channel) => {
          if (channels.find((a) => {return (a.id === x.id)}) === undefined)
            newPublicList = [...newPublicList, x];
        });
        console.log("[DEBUG] : publicChannels:", newPublicList);
        setPublicChannels(newPublicList); 
      });

      return (() => {
        socket.off('publicList'); 
      });
    }, [channels]);

    const onClick = (channel: Channel) => (e: any) => {
      socket.emit('joinChannel', channel, (channel : Channel) => {
        socket.emit('joinedList');
        socket.emit('getChannel', channel, (channel : Channel) => {
          setCurrentChannel(channel)
        });
      });
      socket.emit('publicList');
    };

    return (
      <ExpansionPanel title="Public conversations list">
        {publicChannels.map((channel, index) => {
          return (
            <Conversation
              key={index}
              name={channel.name}
              onClick={onClick(channel)}/>
          )})}
      </ExpansionPanel>
    );
  }

  function RenderInvitedConversations() {
    const onClick = (channel: Channel) => (e: any) => {
      // setCurrentChannel(channel);
      // socket.emit('joinChannel', channel, (data : Channel) => {
      //   setChannels([...channels, data]);
      // })};
    }

    return (
      <ExpansionPanel title="Invited conversations list">
        {invitedChannels.map((channel, index) => {
          return (
            <Conversation
              key={index}
              name={channel.name}
              onClick={onClick(channel)}/>
          )})}
      </ExpansionPanel>
    )
  }

  function RenderChatContainer() {
    console.count("renderChatContainer")

    // useEffect(() => {

    // }, []);

    const leaveChannel = (e: any) => {
      console.log("leaving channel", currentChannel.name)
      socket.emit('leaveChannel', currentChannel, () => {
        socket.emit('joinedList')
      })}

    const openProfile = (ft_login: string) => (e: any) => {
      e.preventDefault();
      setProfilSidebar(ft_login);
    }

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
            <AddUserButton
              style={{fontSize: "1.4em"}}
              title={currentChannel.status === "Direct" ? "Add as friend" : "Invite a friend"}
              // if already friend, change button to faUserMinus
              />
            {currentChannel.status !== "Direct" ? <></> :
            <Button
              style={{fontSize: "1.4em"}}
              icon={<FontAwesomeIcon icon={faUserSlash}/>}
              title="Block this person"
              />}
            {currentChannel.status === "Direct" ? <></> :
            <Button
              style={{fontSize: "1.4em"}}
              icon={<FontAwesomeIcon icon={faArrowRightFromBracket}/>}
              title="Leave this conversation"
              onClick={leaveChannel}
              />}
          </ConversationHeader.Actions>
        </ConversationHeader>

        <MessageList>
          {currentChannel.messages.map((message, index) => {
            return (
              <Message
                key={index}
                model={{
                  message: message.content,
                  sentTime: message.time.toString(),
                  sender: message.sender.username,
                  direction: "incoming",
                  position: "single"
                }}
                // avatarPosition="tl"
              >
                <Message.Header sender={message.sender.username} />
                <Avatar src={avatar_temp} onClick={openProfile(message.sender.ft_login)}/>
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
      <ExpansionPanel title="Create Channel">
        <form onSubmit={onSubmit}>
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
      </ExpansionPanel>
    );
  }

  function RenderRightSidebar() {

    return (
      <Sidebar position="right">
        { profilSidebar !== "" ?
          <>
            <h1>Profil panel : {profilSidebar}</h1>
          </>
          :
          <>
            <h1>Admin Panel</h1>
          </>
        }
      </Sidebar>
    );
  }

  function sendMessage(content : string) {
    const message : Message = {} as Message;

    message.content = content;
    console.log(content, currentChannel);
    socket.emit("sendMsg", {
      content: content,
      channelId: currentChannel.id,
    }, () => { socket.emit("getChannel", currentChannel, (data : Channel) => {
      setCurrentChannel(data);
    })})
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
          <RenderCreateChannel />
          <RenderConversations />
          <RenderPublicConversations/>
          <RenderInvitedConversations/>
        </Sidebar>
        <RenderRightSidebar />
        <RenderChatContainer />
      </MainContainer>
    </div>
  );
}
