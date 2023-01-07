import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Channel } from './Channel';
import Popup from './Popup'
import './Chat.css';
import JoinChannel from './JoinChannel';
import AddFriend from './AddFriend';
import { PopupChildProps } from './Popup';
import InviteChannel from './InviteChannel';

interface ChannelSidebarProps {
  socket: Socket;
  onChannelClick: (key : number) => (event : any) => void;
}

export default function ChannelSidebar(props: ChannelSidebarProps) {
  const [chanName, setName] = useState<string | null>(null);
  const [channels, setChannels] = useState([]);
  const [invitedChannels, setInvitedChannels] = useState([]);
  const [popup, setPopup] = useState<boolean>(false);
  const [functionPopup, setFunctionPopup] = 
    useState<(props: PopupChildProps) => JSX.Element>(() => <></>);

  useEffect(() => {
    props.socket.on('joinedList', (data) => {
      console.log('joinedList', data);
      setChannels(data);
    });

    props.socket.on('invitedList', (data) => {
      setInvitedChannels(data);
    });

    props.socket.emit('joinedList');
    props.socket.emit('invitedList');

    return (() => {
      props.socket.off('joinedList');
      props.socket.off('invitedList');
    });
  }, []);

  return (
    <>
      <div className="sidebar">
        <p>ChannelSidebar</p>
        {channels.map((channel: Channel) => (
          <div
            key={channel.id}
            className="channel"
            onClick={props.onChannelClick(channel.id)}>
            {channel.name}
            <button onClick={() => {
              setPopup(true);
              setFunctionPopup(() => InviteChannel);
              setName(channel.name);
            }}>invite</button>
            <button onClick={() => {
              props.socket.emit('leaveChannel', { name: channel.name },
              () => {
                props.socket.emit('joinedList');
              });
            }}>leave
            </button>
          </div>
        ))}

        {
          invitedChannels.length <= 0 ? null :
          <>
          <p>Invited Channel</p>
          {invitedChannels.map((channel: Channel) => (
            <div
              key={channel.id}
              className="channel"
              onClick={() => {
                props.socket.emit('join', {
                  "name": channel.name
                })}}>
              {channel.name}
            </div>
          ))}
          </>
        }
      </div>
      <div>
        <button className="join"
          onClick={() => {
            setPopup(true);
            setFunctionPopup(() => JoinChannel);
          }}
        >
          Join channel.</button>
        <button className="add"
          onClick={() => {
            setPopup(true);
            setFunctionPopup(() => AddFriend);
          }}
        >Add friend.</button>
      </div>
      {
        popup &&
        <Popup
          functionToRender={functionPopup}
          setPopup={setPopup}
          socket={props.socket}
          chanName={chanName}
        />
      }
    </>
  );
}