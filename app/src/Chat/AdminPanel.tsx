import { useContext, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {
  Avatar,
  Button,
} from '@chatscope/chat-ui-kit-react';
import { getLoginContext } from 'WebSocketWrapper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faKey, faLock, faLockOpen, faPen, faXmark } from '@fortawesome/free-solid-svg-icons';

import { tUser, tChannel } from './ChatPage';
import { Socket } from 'socket.io-client';

interface AdminProps {
    currentChannel : tChannel;
    socket: Socket;
}

export default function AdminPanel(props: AdminProps) {
    const login = useContext(getLoginContext);

    function isAdmin(users: any) : boolean {
      console.log("isAdmin", users);
      const user = users.find((element: any) => element.user.ft_login === login.value);

      return user.rights === "Owner" || user.rights === "Admin"
    }

    if (!isAdmin(props.currentChannel.users))
      return (null);

    return (
      <>
        <h1>Admin Admin !</h1>
        {props.currentChannel.users.map((data: any, index) => {
          const user : tUser = data.user;
          return (
            <div key={index}>
              <Avatar src={user.avatarURL} name={user.username} size="md"/>
              
            </div>
          )
        })}
      </>
    );
  }