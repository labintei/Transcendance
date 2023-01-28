import { useContext, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {
  Avatar,
  Button,
} from '@chatscope/chat-ui-kit-react';
import { getLoginContext } from 'WebSocketWrapper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCommentSlash, faUserSlash } from '@fortawesome/free-solid-svg-icons';

import { tUser, tChannelUser, tChannel } from './ChatPage';
import { Socket } from 'socket.io-client';

interface AdminProps {
    currentChannel : tChannel;
    socket: Socket;
}

export default function AdminPanel(props: AdminProps) {
    const login = useContext(getLoginContext);

    let timestamp: HTMLInputElement | null = null;

    function isAdmin(users: tChannelUser[]) : boolean {
      console.log("isAdmin", users);
      const user = users.find((element: any) => element.user.ft_login === login.value);

      if (user === undefined)
        return false;
      return user.rights === "Owner" || user.rights === "Admin"
    }

    const setPermissionsUser = (user: tChannelUser, type: string) => (e: any) => {
      const updated_user = user;
      const time = new Date();

      if (type === "Kicked")
        updated_user.rights = null;
      if (type === "Banned" || type === "Muted") {
        time.setSeconds(time.getSeconds() + 10);
        updated_user.rights = type;
        updated_user.rightsEnd = time;
      }

      props.socket.emit('setPermissions', updated_user);
    }

    if (!isAdmin(props.currentChannel.users))
      return (null);

    return (
      <>
        <h1>Admin Admin !</h1>
        {props.currentChannel.users.map((data, index) => {
          const user : tUser = data.user;
          return (
            <div key={index}>
                <p>{user.username}</p>
                <Button
                  icon={<FontAwesomeIcon icon={faCommentSlash} />}
                  title="Mute user"
                  >
                    Mute
                </Button>
                <Button
                  icon={<FontAwesomeIcon icon={faUserSlash} />}
                  title="Kick user"
                  onClick={setPermissionsUser(data, "Kicked")}
                  >
                    Kick
                </Button>
                <Button
                  icon={<FontAwesomeIcon icon={faBan} />}
                  title="Ban user"
                  onClick={setPermissionsUser(data, "Banned")}
                  >
                    Ban
                </Button>
                <input
                  type="number"
                  placeholder="Fouts des minutes tocards"
                />
            </div>
          )
        })}
      </>
    );
  }