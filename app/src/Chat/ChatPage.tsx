import React, { useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketContext } from 'WebSocketWrapper';
import { getLoginContext } from 'WebSocketWrapper';
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
  AddUserButton,
  ArrowButton
} from '@chatscope/chat-ui-kit-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faCheck, faKey, faLock, faLockOpen, faPen, faUserSlash, faXmark } from '@fortawesome/free-solid-svg-icons';
import OwnerPanel from './OwnerPanel';
import AdminPanel from './AdminPanel';

const avatar_temp = "logo192.png";

// const backend_url = process.env.REACT_APP_BACKEND_URL || '';
// const socket = io(backend_url, { withCredentials: true });

export interface tMessage {
  time: Date;
  content: string;
  sender: tUser;
}

export interface tUser {
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

export interface tChannelUser {
  channelId: number;
  userLogin: string;
  rights: string | null;
  status: string | null;
  rightsEnd: Date;
  user: tUser;
}

export interface tChannel {
  id: number;
  status: string;
  password: string;
  name: string;
  users: tChannelUser[];
  messages: tMessage[];
}

const temp_msg : tMessage[] = [
  {time: new Date(), content: "Hello World this is a test", sender: {ft_login: "ft_bob", username: "Bob"} as tUser},
  {time: new Date(), content: "Hello World this is another test", sender: {ft_login: "ft_bob", username: "Bob"} as tUser},
  {time: new Date(), content: "Hello World this is still a test", sender: {ft_login: "ft_bob", username: "Bob"} as tUser},
];

const empty_chan = {id: 0, status: "", name: "", messages: temp_msg} as tChannel;

export default function Chat() {
  const [currentChannel, setCurrentChannel] = useState<tChannel>(empty_chan);
  const [channels, setChannels] = useState<tChannel[]>([]);
  const [invitedChannels, setInvitedChannels] = useState<tChannel[]>([]);
  const [profilSidebar, setProfilSidebar] = useState<string>("");
  const [publicChannels, setPublicChannels] = useState<tChannel[]>([]);

  const refChannel = useRef(currentChannel);

  const socket = useContext(getSocketContext);
  const login = useContext(getLoginContext);

  function callback(data: any) {
    if (data.channelId === refChannel.current.id)
    {
      const messages = [...refChannel.current.messages, data];
      console.log(messages);
      setCurrentChannel({...refChannel.current, messages: messages})
    }
  }

  useEffect(() => {
    refChannel.current = currentChannel;
  })

  useEffect(() => {
    if (!socket.connected) {
        return ;
    }
    socket.on('error', (data) => { console.log('error', data) });
    socket.on('connect', () => { console.log('connected') });
    socket.on('disconnect', () => { console.log('disconnected') });
    socket.on('message', callback);
    socket.on('updateChannel', () => { console.log("updateChannel"); socket.emit('joinedList') });

    socket.on('hideChannel', (channel : tChannel) => {
      console.log("HIDE", channel);
      // console.log()
      if (channel.id === refChannel.current.id)
        setCurrentChannel(empty_chan);
    })

    socket.on('joinedList', (data) => {
      console.log("[WS] joinedList");
      setChannels(data);
      if (data.length !== 0 && refChannel.current.id === 0) {
        socket.emit('getChannel', data[0], (newCurrentChannel : tChannel) => {
          setCurrentChannel(newCurrentChannel);
        })}
      socket.emit('publicList');
    });

    socket.emit('joinedList');
    // This code will run when component unmount
    return () => {
      socket.off('error');
      socket.off('message');
      socket.off('joinedList');
      socket.off('hideChannel');
      socket.off('updateChannel');
    };
  }, [login.value]);

  function RenderConversations() {
    const switchChannel = (channel: tChannel) => (e: any) => {
      socket.emit('getChannel', channel, (data: tChannel) => {
        console.log(data);
        setCurrentChannel(data);
      });
    };

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
    const [state, setState] = useState<number>(0);
    let password: HTMLInputElement | null = null;

    useEffect(() => {
      socket.on('publicList', (chans : tChannel[]) => {
        let newPublicList : tChannel[] = [];
        console.log("[DEBUG]: channels:", channels);
        chans.filter((x : tChannel) => {
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

    const onClick = (channel: tChannel) => (e: any) => {
      e.preventDefault();
      if (channel.status === "Protected")
      {
        if (state === channel.id)
          setState(0);
        else
          setState(channel.id);
        return ;
      }

      socket.emit('joinChannel', channel, (channel : tChannel) => {
        socket.emit('joinedList');
        socket.emit('getChannel', channel, (channel : tChannel) => {
          setCurrentChannel(channel)
        });
      });
      // socket.emit('joinedList');
    };

    const onSubmit = (channel: tChannel) => (e: any) => {
      e.preventDefault();

      channel.password = password!.value;

      socket.emit('joinChannel', channel, (channel : tChannel) => {
        socket.emit('joinedList');
        socket.emit('getChannel', channel, (channel : tChannel) => {
          setCurrentChannel(channel)
        });
      });
    }

    return (
      <ExpansionPanel title="Public conversations list">
        {publicChannels.map((channel, index) => {
          return (
          <div key={index}>
            <Conversation
              name={channel.name}
              onClick={onClick(channel)}/>
            {state !== channel.id ? <></> :
              <form onSubmit={onSubmit(channel)}>
                <input
                  type="input"
                  placeholder="Password"
                  ref={node => password = node}
                  required
                />
              <Button>Create</Button>
            </form>
            }
            </div>
          )})}
      </ExpansionPanel>
    );
  }

  function RenderInvitedConversations() {
    const onClick = (channel: tChannel) => (e: any) => {
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

    const leaveChannel = (e: any) => {
      console.log("leaving channel", currentChannel.name)
      socket.emit('leaveChannel', currentChannel, (data : any) => {
        console.log("leave emit", data)
        socket.emit('joinedList');
      })
    }

    const openProfile = (ft_login: string) => (e: any) => {
      e.preventDefault();
      setProfilSidebar(ft_login);
    }

    if (currentChannel.id === 0)
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
                  direction: login.value === message.sender.ft_login ? "outgoing" : "incoming",
                  position: "single",
                  type: "text"
                }}
                // avatarPosition="tl"
              >
                <Message.Header sender={message.sender.username} />
                <Avatar src={message.sender.avatarURL} onClick={openProfile(message.sender.ft_login)}/>
              </Message>
            )
          })}
        </MessageList>

        <MessageInput
            attachButton={false}
            onSend={sendMessage}
            placeholder="Type message here ..."
            autoFocus />
      </ChatContainer>
    );
  }

  function RenderCreateChannel() {
    const [check, setCheck] = useState({password: false, private: false});
    let channelName: HTMLInputElement | null = null;
    let password: HTMLInputElement | null = null;

    function onSubmit(e : any) {
      e.preventDefault();

      const new_chan : tChannel = {
        status: "Public",
        name: channelName!.value,
      } as tChannel;

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
          <Button>
            Create
          </Button>
        </form>
      </ExpansionPanel>
    );
  }

  function RenderRightSidebar() {
    function shouldRender() : boolean {
      if (profilSidebar !== "")
        return true;
      if (currentChannel.status === "Direct")
        return false;
      if (currentChannel.id === 0)
        return false;
      const users : any = currentChannel.users;
      const user = users.find((element: any) => element.user.ft_login === login.value);
      if (user.rights === "Owner" || user.rights === "Admin")
        return true;
      return false;
    }

    if (!shouldRender())
      return null;

    return (
      <Sidebar position="right">
        { profilSidebar !== "" || currentChannel.id === 0?
          <>
            <ArrowButton direction="left" onClick={() => setProfilSidebar("")}/>
            <h1>Profil panel : {profilSidebar}</h1>
          </>
          :
          <>
            <OwnerPanel currentChannel={currentChannel} socket={socket}/>
            <AdminPanel currentChannel={currentChannel} socket={socket}/>
          </>
        }
      </Sidebar>
    );
  }

  function sendMessage(content : string) {
    const message : tMessage = {} as tMessage;

    message.content = content;
    console.log(content, currentChannel);
    socket.emit("sendMsg", {
      content: content,
      channelId: currentChannel.id,
    }, () => { socket.emit("getChannel", currentChannel, (data : tChannel) => {
      console.log("AAAAAA");
      setCurrentChannel(data);
    })})
  }

  return (
    <div style={{
      height: "600px",
      position: "relative",
      textAlign: "initial"
    }}>
      { login.value === "" ? 
        <Navigate to="/login"></Navigate>
      :
        <></>
      }
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
