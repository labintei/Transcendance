import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Channel } from './Channel';
import './Chat.css';

interface ChannelSidebarProps {
  socket: Socket | null;
  onChannelClick: (key : number) => (event : any) => void;
}

function ChannelSidebar(props: ChannelSidebarProps) {
  const [channels, setChannels] = useState([]);

  useEffect(() => {

    if (!props.socket) return;
    props.socket.emit('getChannels');

    props.socket.on('getChannels', (data) => {
      // console.log('getChannels', data);
      setChannels(data);
    });
  }, [props.socket]);

  return (
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
  );
}

export default ChannelSidebar;