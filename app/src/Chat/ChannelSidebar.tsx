import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Channel } from './Channel';
import PopupJoin from './PopupJoin';
import './Chat.css';

interface ChannelSidebarProps {
  socket: Socket;
  onChannelClick: (key : number) => (event : any) => void;
}

export default function ChannelSidebar(props: ChannelSidebarProps) {
  const [channels, setChannels] = useState([]);
  const [isActive, setActive] = useState<boolean>(false);

  useEffect(() => {
    props.socket.on('getChannels', (data) => {
      console.log('getChannels', data);
      setChannels(data);
    });

    props.socket.emit('getChannels');
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
        {isActive ? <PopupJoin/> : null}
        <button className="join"
          onClick={() => {
            setActive(!isActive);
          }}
        >
          Join channel.</button>
        <button className="add">Add friend.</button>
      </div>
    </>
  );
}