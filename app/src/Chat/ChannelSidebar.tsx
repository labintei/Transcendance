import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Channel } from './Channel';
import Popup from './Popup'
import './Chat.css';
import JoinChannel from './JoinChannel';
import AddFriend from './AddFriend';
import { PopupChildProps } from './Popup';

interface ChannelSidebarProps {
  socket: Socket;
  onChannelClick: (key : number) => (event : any) => void;
}

export default function ChannelSidebar(props: ChannelSidebarProps) {
  const [channels, setChannels] = useState([]);
  const [popup, setPopup] = useState<boolean>(false);
  const [functionPopup, setFunctionPopup] = 
    useState<(props: PopupChildProps) => JSX.Element>(() => <></>);

  useEffect(() => {
    props.socket.on('joinedList', (data) => {
      console.log('joinedList', data);
      setChannels(data);
    });

    props.socket.emit('joinedList');
  }, [props.socket]);

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
          </div>
        ))}
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
        />
      }
    </>
  );
}