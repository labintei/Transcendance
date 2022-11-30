import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Channel } from './Channel';
import Popup, { popupType } from './Popup'
import './Chat.css';

interface ChannelSidebarProps {
  socket: Socket;
  onChannelClick: (key : number) => (event : any) => void;
}

export default function ChannelSidebar(props: ChannelSidebarProps) {
  const [channels, setChannels] = useState([]);
  const [popup, setPopup] = useState<popupType>(popupType.None);

  useEffect(() => {
    props.socket.emit('joinedList', (answer: any) => {
      setChannels(answer);
    });

    props.socket.on('joinedList', (data) => {
      // console.log('getChannels', data);
      console.log("[DEBUG] : joinedList", data);

      setChannels(data);
    });
    return (() => {
      props.socket.off('joinedList');
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
          </div>
        ))}
      </div>
      <div>
        <button className="join"
          onClick={() => {
            setPopup(popupType.JoinChannelPopup);
          }}
        >
          Join channel.</button>
        <button className="add"
          onClick={() => {
            setPopup(popupType.AddFriendPopup);
          }}
        >Add friend.</button>
      </div>
      {
        popup !== popupType.None
        ? <Popup
          popup={popup}
          setPopup={setPopup}
          socket={props.socket}
          />
        : null
      }
    </>
  );
}