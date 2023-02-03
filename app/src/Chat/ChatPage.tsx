import { useContext, useEffect, useRef, useState } from 'react';
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

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import Linkify from 'react-linkify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faUser, faUserMinus, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import OwnerPanel from './OwnerPanel';
import AdminPanel from './AdminPanel';
import axios from 'axios';

import { IChannel, IChannelUser, IMessage, IUser } from './interface';
import ProfilPanel from './ProfilPanel';

const empty_chan = {id: 0, status: "", name: "", messages: {}} as IChannel;

const backend_url = process.env.REACT_APP_BACKEND_URL;
export const backend_url_block = backend_url + "blockeds/";
export const backend_url_friend = backend_url + "friends/";

export function parseEvent(event: string) : {type: string, error: string} | null {
  const match = event.match(/\[Event '(.*)'\] (.*)/);
  return match === null ? null : {
    type: `${match[1]}`,
    error: match[2]
  };
}

export function notificationError(msg: string) {
  toast.error(msg, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    });
}

export default function Chat() {
  const [currentChannel, setCurrentChannel] = useState<IChannel>(empty_chan);
  const [channels, setChannels] = useState<IChannel[]>([]);
  const [invitedChannels, setInvitedChannels] = useState<IChannel[]>([]);
  const [profilSidebar, setProfilSidebar] = useState<IUser | null>(null);
  const [publicChannels, setPublicChannels] = useState<IChannel[]>([]);
  const [directChannels, setDirectChannels] = useState<IChannel[]>([]);

  const [relations, setRelations] = useState<{friends: IUser[], blocked: IUser[]}>({friends: [], blocked: []});

  const [state, setState] = useState<string>("Pending");

  const refChannel = useRef(currentChannel);

  const socket = useContext(getSocketContext);
  const login = useContext(getLoginContext);

  useEffect(() => {
    refChannel.current = currentChannel;
  })

  useEffect(() => {
    if (state !== "Done") {
      if (socket.connected)
        setState("Done");
      else
        isLogged();
      return ;
    }

    function callbackMessage(data: IMessage) {
      if (data.channelId === refChannel.current.id) {
        const messages = [...refChannel.current.messages, data];
        setCurrentChannel({...refChannel.current, messages: messages})
      }
      socket.emit('directList');
    }

    function callbackUpdateChannel(data: IChannel) {
      if (data.id === refChannel.current.id) {
        socket.emit('getChannel', refChannel.current, (data: IChannel) => {
          setCurrentChannel(data);
        });
      }
      socket.emit('joinedList');
      socket.emit('directList');
    }

    socket.on('error', (data) => {
      const event = parseEvent(data);
      notificationError(event!.error);
    })
    socket.on('message', callbackMessage);
    socket.on('updateChannel', callbackUpdateChannel);

    socket.on('hideChannel', (channel : IChannel) => {
      if (channel.id === refChannel.current.id)
        setCurrentChannel(empty_chan);
    })

    socket.on('joinedList', (data) => {
      setChannels(data);
      if (data.length !== 0 && refChannel.current.id === 0) {
        socket.emit('getChannel', data[0], (newCurrentChannel : IChannel) => {
          setCurrentChannel(newCurrentChannel);
        })}
      socket.emit('publicList');
    });

    socket.on('directList', (data) => {
      setDirectChannels(data);
    })

    socket.on('invitedList', (data) => {
      setInvitedChannels(data);
    })

    socket.emit('joinedList');
    socket.emit('directList');
    socket.emit('invitedList');

    getRelations();

    // This code will run when component unmount
    return () => {
      socket.off('message');
      socket.off('error');
      socket.off('joinedList');
      socket.off('directList');
      socket.off('invitedList');
      socket.off('hideChannel');
      socket.off('updateChannel');
    };
  }, [login.value, socket, state]);

  function isLogged() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then((rec) => {
      setState("Done");
    }).catch(() => {
      setState("Failed");
    });
  }

  function getRelations() {
    axios.all([
      axios.get(backend_url_block, {
        withCredentials: true
      }),
      axios.get(backend_url_friend, {
        withCredentials: true
      })
    ])
    .then(axios.spread((rec1, rec2) => {
      setRelations({
        blocked: rec1.data,
        friends: rec2.data,
      })
      // console.log(rec1.data, rec2.data);
    }))
    .catch((rec) => {
    })
  }

  function blockUser(user: IUser) {
    axios.put(backend_url_block + user.username, {}, {
      withCredentials: true
    }).then((rec) => {
      getRelations();
    }).catch((rec) => {
    })
  }

  function unblockUser(user: IUser) {
    axios.delete(backend_url_block + user.username, {
      withCredentials: true
    }).then((rec) => {
      getRelations();
    }).catch((rec) => {
    })
  }

  function isBlocked(username: string) : boolean {
    const user = relations.blocked.find(user => user.username === username);
    return (user !== undefined)
  }

  function isBlockedDirect() : boolean {
    const chanUser = currentChannel.users.find(element => element.userLogin !== login.value);

    return (chanUser === undefined ? false : isBlocked(chanUser.user.username))
  }

  function friendUser(user: IUser) {
    axios.put(backend_url_friend + user.username, {}, {
      withCredentials: true
    }).then((rec) => {
      getRelations()
    }).catch((rec) => {
    })
  }

  function unfriendUser(user: IUser) {
    axios.delete(backend_url_friend + user.username, {
      withCredentials: true
    }).then((rec) => {
      getRelations()
    }).catch((rec) => {
    })
  }

  function isFriend(username: string) : boolean {
    const user = relations.friends.find(user => user.username === username);
    return (user !== undefined)
  }

  function isFriendDirect() : boolean {
    const chanUser = currentChannel.users.find(element => element.userLogin !== login.value);

    return (chanUser === undefined ? false : isFriend(chanUser.user.username))
  }

  function getName(channel: IChannel) : string {
    if (channel.status !== "Direct")
      return (channel.name);
    const chanUser = channel.users.find((user) => login.value !== user.userLogin);
    return (chanUser!.user.username);
  }

  function getOtherUser(channel: IChannel) : IUser | null {
    if (channel.status !== "Direct")
      return null;
    const chanUser = channel.users.find((user) => login.value !== user.userLogin);
    return (chanUser!.user);
  }

  function RenderConversations() {
    const switchChannel = (channel: IChannel) => (e: any) => {
      socket.emit('getChannel', channel, (data: IChannel) => {
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

        const newPublicList = chans.reduce((acc: IChannel[], x: IChannel) => {
          if (!channels.find(a => a.id === x.id)) {
            acc.push(x);
          }
          return acc;
        }, []);

        setPublicChannels(newPublicList); 
      });

      return (() => {
        socket.off('publicList'); 
      });
    }, []);

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
        socket.emit('invitedList');
        socket.emit('getChannel', channel, (channel : IChannel) => {
          setCurrentChannel(channel)
        });
      });
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

    const leaveChannel = (e: any) => {
      socket.emit('leaveChannel', currentChannel, (data : any) => {
        socket.emit('joinedList');
      })
    }

    const openProfile = (user: IUser) => (e: any) => {
      e.preventDefault();
      setProfilSidebar(user);
    }

    const block = (users: IChannelUser[]) => (e: any) => {
      e.preventDefault();
      const user = currentChannel.users.find(element => element.userLogin !== login.value);

      if (user !== undefined) {
        blockUser(user.user);
      } 
    }

    const unblock = (users: IChannelUser[]) => (e: any) => {
      e.preventDefault();
      const user = currentChannel.users.find(element => element.userLogin !== login.value);

      if (user !== undefined) {
        unblockUser(user.user);
      } 
    }

    const friend = (users: IChannelUser[]) => (e: any) => {
      e.preventDefault();
      const user = currentChannel.users.find(element => element.userLogin !== login.value);

      if (user !== undefined) {
        friendUser(user.user);
      } 
    }

    const unfriend = (users: IChannelUser[]) => (e: any) => {
      e.preventDefault();
      const user = currentChannel.users.find(element => element.userLogin !== login.value);

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
      invited_user.user = {} as IUser;
      invited_user.user.username = invite!.value;
      // console.log("blocked", relations.blocked);
      // console.log("isBlocked", isBlocked(invite!.value));
      if (isBlocked(invite!.value)) {
        notificationError("You cannot invite someone you've blocked");
        return ;
      }
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

    const other_user = getOtherUser(currentChannel);

    return (
      <ChatContainer>
        <ConversationHeader>
          {currentChannel.status !== "Direct" ? null :
          <Avatar
            src={other_user!.avatarURL}
            name={other_user!.username}
            onClick={openProfile(other_user!)}
            />
          }

          <ConversationHeader.Content
            userName={getName(currentChannel)}
            />
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
                      placeholder="Insert username"
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
                  type: "html"
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
            fancyScroll={false}
            placeholder="Type message here ..."
            autoFocus />
      </ChatContainer>
    );
  }

  function RenderCreateChannel() {
    const [check, setCheck] = useState({password: false, private: false});

    let channelName: HTMLInputElement | null = null;
    let password: HTMLInputElement | null = null;

    function stripWhitespace(input: string): string | null {
      const stripped = input.trim();
      if (!stripped) {
        return null;
      }
      return stripped;
    }

    function onSubmit(e : any) {
      e.preventDefault();

      const chan_name = stripWhitespace(channelName!.value);

      if (!chan_name) {
        channelName!.value = "";
        return ;
      }

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

  function sendMessage(innerHtml: string, textContent: string, innerText: string, nodes: NodeList) {
    socket.emit("sendMsg", {
      content: textContent,
      channelId: currentChannel.id,
    }, () => { socket.emit("getChannel", currentChannel, (data : IChannel) => {
      setCurrentChannel(data);
    })})
  }

  return (
    <div style={{
      height: "calc(100vh - 65px)",
      position: "relative",
      textAlign: "initial"
    }}>
      { state === "Failed" ? 
        <Navigate to="/login"></Navigate>
      :
        state === "Pending" ?
          <div>Loading...</div>
        :
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
      }
    </div>
  );
}
