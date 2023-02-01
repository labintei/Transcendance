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

import Linkify from 'react-linkify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faCheck, faKey, faLock, faLockOpen, faPen, faUser, faUserMinus, faUserSlash, faXmark } from '@fortawesome/free-solid-svg-icons';
import OwnerPanel from './OwnerPanel';
import AdminPanel from './AdminPanel';
import axios from 'axios';

import { IChannel, IChannelUser, IMessage, IUser } from './interface';
import ProfilPanel from './ProfilPanel';

const avatar_temp = "logo192.png";

// const backend_url = process.env.REACT_APP_BACKEND_URL || '';
// const socket = io(backend_url, { withCredentials: true });

const temp_msg : IMessage[] = [
  {time: new Date(), content: "Hello World this is a test", sender: {ft_login: "ft_bob", username: "Bob"} as IUser} as IMessage,
  {time: new Date(), content: "Hello World this is another test", sender: {ft_login: "ft_bob", username: "Bob"} as IUser} as IMessage,
  {time: new Date(), content: "Hello World this is still a test", sender: {ft_login: "ft_bob", username: "Bob"} as IUser} as IMessage,
];

const empty_chan = {id: 0, status: "", name: "", messages: temp_msg} as IChannel;

const backend_url = process.env.REACT_APP_BACKEND_URL;
export const backend_url_block = backend_url + "blockeds/";
export const backend_url_friend = backend_url + "friends/";


export default function Chat() {
  const [currentChannel, setCurrentChannel] = useState<IChannel>(empty_chan);
  const [channels, setChannels] = useState<IChannel[]>([]);
  const [invitedChannels, setInvitedChannels] = useState<IChannel[]>([]);
  const [profilSidebar, setProfilSidebar] = useState<IUser | null>(null);
  const [publicChannels, setPublicChannels] = useState<IChannel[]>([]);
  const [directChannels, setDirectChannels] = useState<IChannel[]>([]);

  const [relations, setRelations] = useState<{friends: IUser[], blocked: IUser[]}>({friends: [], blocked: []});

  const refChannel = useRef(currentChannel);

  const socket = useContext(getSocketContext);
  const login = useContext(getLoginContext);

  function callbackMessage(data: IMessage) {
    console.log("callbackMessage", data);
    if (data.channelId === refChannel.current.id) {
      const messages = [...refChannel.current.messages, data];
      console.log(messages);
      setCurrentChannel({...refChannel.current, messages: messages})
    }
    socket.emit('directList');
  }

  function callbackUpdateChannel(data: IChannel) {
    console.log("callbackUpdateChannel", data);
    if (data.id === refChannel.current.id) {
      socket.emit('getChannel', refChannel.current, (data: IChannel) => {
        setCurrentChannel(data);
      });
    }
    socket.emit('joinedList');
    socket.emit('directList');
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
    socket.on('message', callbackMessage);
    socket.on('updateChannel', callbackUpdateChannel);

    socket.on('hideChannel', (channel : IChannel) => {
      console.log("HIDE", channel);
      // console.log()
      if (channel.id === refChannel.current.id)
        setCurrentChannel(empty_chan);
    })

    socket.on('joinedList', (data) => {
      console.log("[WS] joinedList");
      setChannels(data);
      if (data.length !== 0 && refChannel.current.id === 0) {
        socket.emit('getChannel', data[0], (newCurrentChannel : IChannel) => {
          setCurrentChannel(newCurrentChannel);
        })}
      socket.emit('publicList');
    });

    socket.on('directList', (data) => {
      console.log("[WS] directList", data);
      setDirectChannels(data);
    })

    socket.on('invitedList', (data) => {
      console.log("[WS] invitedList", data);
      setInvitedChannels(data);
    })

    socket.emit('joinedList');
    socket.emit('directList');
    socket.emit('invitedList');

    getRelations();
    // This code will run when component unmount
    return () => {
      socket.off('error');
      socket.off('message');
      socket.off('joinedList');
      socket.off('hideChannel');
      socket.off('updateChannel');
    };
  }, [login.value]);

  function getRelations() {
    axios.get(backend_url_block, {
      withCredentials: true
    }).then((rec) => {
      console.log("blocked users :", rec.data);
      setRelations({
        ...relations,
        blocked: rec.data,
      })
    }).catch((rec) => {
      console.log("error request", rec);
    })

    axios.get(backend_url_friend, {
      withCredentials: true
    }).then((rec) => {
      console.log("friends :", rec.data);
      setRelations({
        ...relations,
        friends: rec.data,
      })
    }).catch((rec) => {
      console.log("error request", rec);
    })
  }
  
  function blockUser(user: IUser) {
    console.log(backend_url_block + user.username);
    axios.put(backend_url_block + user.username, {}, {
      withCredentials: true
    }).then((rec) => {
      getRelations();
    }).catch((rec) => {
      console.log(rec);
    })
  }

  function unblockUser(user: IUser) {
    console.log(backend_url_block + user.username);
    axios.delete(backend_url_block + user.username, {
      withCredentials: true
    }).then((rec) => {
      getRelations();
    }).catch((rec) => {
      console.log(rec);
    })
  }

  function isBlocked(username: string) : boolean {
    const user = relations.blocked.find(user => user.username === username);
    return (user !== undefined)
  }

  function isBlockedDirect() : boolean {
    const chanUser = currentChannel.users.find(element => element.userLogin != login.value);

    return (chanUser === undefined ? false : isBlocked(chanUser.user.username))
  }

  function friendUser(user: IUser) {
    console.log(backend_url_friend + user.username);
    axios.put(backend_url_friend + user.username, {}, {
      withCredentials: true
    }).then((rec) => {
      getRelations()
    }).catch((rec) => {
      console.log(rec);
    })
  }

  function unfriendUser(user: IUser) {
    console.log(backend_url_friend + user.username);
    axios.delete(backend_url_friend + user.username, {
      withCredentials: true
    }).then((rec) => {
      getRelations()
    }).catch((rec) => {
      console.log(rec);
    })
  }

  function isFriend(username: string) : boolean {
    const user = relations.friends.find(user => user.username === username);
    return (user !== undefined)
  }

  function isFriendDirect() : boolean {
    const chanUser = currentChannel.users.find(element => element.userLogin != login.value);

    return (chanUser === undefined ? false : isFriend(chanUser.user.username))
  }

  function RenderConversations() {
    const switchChannel = (channel: IChannel) => (e: any) => {
      socket.emit('getChannel', channel, (data: IChannel) => {
        console.log("getChannel", data);
        setCurrentChannel(data);
      });
    };

    function getName(channel: IChannel) : string {
      // console.log("debug debug", channel);
      if (channel.status !== "Direct")
        return (channel.name);

      // console.log("debug debug", channel);

      const chanUser = channel.users.find((user) => login.value !== user.userLogin);
      // console.log("debug debug", channel);
      return (chanUser!.user.username);
    }

    return (
      <ExpansionPanel title="Conversations list" open={true}>
        {channels.map((channel, index) => {
          return (
            <Conversation
              key={index}
              active={channel.id === currentChannel.id}
              name={getName(channel)}
              onClick={switchChannel(channel)}/>
          )})}
        {directChannels.map((channel, index) => {
          return (
            <Conversation
              key={index}
              active={channel.id === currentChannel.id}
              name={getName(channel)}
              onClick={switchChannel(channel)}/>
          )})}
      </ExpansionPanel>
    )
  }

  function RenderPublicConversations() {
    const [state, setState] = useState<number>(0);
    let password: HTMLInputElement | null = null;

    useEffect(() => {
      socket.on('publicList', (chans : IChannel[]) => {
        let newPublicList : IChannel[] = [];
        console.log("[DEBUG]: channels:", channels);
        chans.filter((x : IChannel) => {
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

    const onClick = (channel: IChannel) => (e: any) => {
      e.preventDefault();
      if (channel.status === "Protected")
      {
        if (state === channel.id)
          setState(0);
        else
          setState(channel.id);
        return ;
      }

      socket.emit('joinChannel', channel, (channel : IChannel) => {
        socket.emit('joinedList');
        socket.emit('getChannel', channel, (channel : IChannel) => {
          setCurrentChannel(channel)
        });
      });
      // socket.emit('joinedList');
    };

    const onSubmit = (channel: IChannel) => (e: any) => {
      e.preventDefault();

      channel.password = password!.value;

      socket.emit('joinChannel', channel, (channel : IChannel) => {
        socket.emit('joinedList');
        socket.emit('getChannel', channel, (channel : IChannel) => {
          setCurrentChannel(channel)
        });
      });
    }

    if (publicChannels.length === 0)
      return <></>

    return (
      <ExpansionPanel title="Public conversations list" open={true}>
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
    const onClick = (channel: IChannel) => (e: any) => {
      socket.emit('joinChannel', channel, (data: IChannel) => {
      socket.emit('joinedList');
      socket.emit('invitedList');
      socket.emit('getChannel', channel, (channel : IChannel) => {
        setCurrentChannel(channel)
      });
      });
    }

    if (invitedChannels.length === 0)
      return <></>

    return (
      <ExpansionPanel title="Invited conversations list" open={true}>
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
    const [state, setState] = useState<string>("");

    let invite: HTMLInputElement | null = null;

    console.count("renderChatContainer");

    const leaveChannel = (e: any) => {
      console.log("leaving channel", currentChannel.name)
      socket.emit('leaveChannel', currentChannel, (data : any) => {
        console.log("leave emit", data)
        socket.emit('joinedList');
      })
    }

    const openProfile = (user: IUser) => (e: any) => {
      e.preventDefault();
      setProfilSidebar(user);
    }

    const block = (users: IChannelUser[]) => (e: any) => {
      e.preventDefault();
      const user = currentChannel.users.find(element => element.userLogin != login.value);

      if (user !== undefined) {
        blockUser(user.user);
      } 
    }

    const unblock = (users: IChannelUser[]) => (e: any) => {
      e.preventDefault();
      const user = currentChannel.users.find(element => element.userLogin != login.value);

      if (user !== undefined) {
        unblockUser(user.user);
      } 
    }

    const friend = (users: IChannelUser[]) => (e: any) => {
      e.preventDefault();
      const user = currentChannel.users.find(element => element.userLogin != login.value);

      if (user !== undefined) {
        friendUser(user.user);
      } 
    }

    const unfriend = (users: IChannelUser[]) => (e: any) => {
      e.preventDefault();
      const user = currentChannel.users.find(element => element.userLogin != login.value);

      if (user !== undefined) {
        unfriendUser(user.user);
      } 
    }

    const inviteUser = (e: any) => {
      e.preventDefault();

      const invited_user = {} as IChannelUser;

      invited_user.status = "Invited";
      invited_user.rights = null;
      invited_user.channelId = currentChannel.id;
      // invited_user.user.username = invite!.value;
      invited_user.userLogin = invite!.value;

      socket.emit('setPermissions', invited_user);
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

            {currentChannel.status !== "Direct" ?
              <>
                {state === "" ?
                  <AddUserButton
                    style={{fontSize: "1.4em"}}
                    title="Invite someone to the conversation"
                    onClick={() => setState("invite")}
                    />
                :
                  <form onSubmit={inviteUser}>
                    <input
                      type="text"
                      placeholder="Insert login"
                      ref={node => invite = node}
                      required
                    />
                    <AddUserButton
                      style={{fontSize: "1.4em"}}
                      title="Invite !"
                      />
                  </form>
                }
                <Button
                  style={{fontSize: "1.4em"}}
                  icon={<FontAwesomeIcon icon={faArrowRightFromBracket}/>}
                  title="Leave this conversation"
                  onClick={leaveChannel}
                  />
              </>
            :
              <>
                {!isFriendDirect() ?
                  <AddUserButton
                  style={{fontSize: "1.4em"}}
                  title="Add this person as a friend"
                  onClick={friend(currentChannel.users)}
                  />
              :
                <Button
                  style={{fontSize: "1.4em"}}
                  icon={<FontAwesomeIcon icon={faUserMinus}/>}
                  title="Unfriend this person"
                  onClick={unfriend(currentChannel.users)}
                  />
                }
                {!isBlockedDirect() ?
                  <Button
                    style={{fontSize: "1.4em"}}
                    icon={<FontAwesomeIcon icon={faUserSlash}/>}
                    title="Block this person"
                    onClick={block(currentChannel.users)}
                    />
                :
                  <Button
                    style={{fontSize: "1.4em"}}
                    icon={<FontAwesomeIcon icon={faUser}/>}
                    title="Unblock this person"
                    onClick={unblock(currentChannel.users)}
                    />
                }
              </>
            }
          </ConversationHeader.Actions>
        </ConversationHeader>

        <MessageList>
          {currentChannel.messages.map((message, index) => {
            return (
              <Message
                key={index}
                model={{
                  sentTime: message.time.toString(),
                  sender: message.sender.username,
                  direction: login.value === message.sender.ft_login ? "outgoing" : "incoming",
                  position: "single",
                  type: "text"
                }}
                // avatarPosition="tl"
              >
                <Message.Header sender={message.sender.username} />
                <Avatar src={message.sender.avatarURL} onClick={openProfile(message.sender)}/>
                <Message.CustomContent>
                  <Linkify componentDecorator={(decoratedHref, decoratedText, key) => 
                    <a target="blank" rel="noopener" href={decoratedHref} key={key}>
                      {decoratedText}
                    </a>
                  }>
                    {!isBlocked(message.sender.username) ? message.content : "This user is blocked."}
                  </Linkify>
                </Message.CustomContent>
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

      const new_chan : IChannel = {
        status: "Public",
        name: channelName!.value,
      } as IChannel;

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
      if (profilSidebar !== null)
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
        { profilSidebar !== null ?
          <>
            <ArrowButton direction="left" onClick={() => setProfilSidebar(null)}/>
            {/* <h1>Profil panel : {profilSidebar!.username}</h1> */}
            <ProfilPanel
              user={profilSidebar}
              socket={socket}
              setCurrent={setCurrentChannel}
              relations={relations}
              setRelations={setRelations}
              />
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
    const message : IMessage = {} as IMessage;

    message.content = content;
    console.log(content, currentChannel);
    socket.emit("sendMsg", {
      content: content,
      channelId: currentChannel.id,
    }, () => { socket.emit("getChannel", currentChannel, (data : IChannel) => {
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
