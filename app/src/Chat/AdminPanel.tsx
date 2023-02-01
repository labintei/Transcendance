import { useContext, useEffect, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import { Button } from '@chatscope/chat-ui-kit-react';
import { getLoginContext } from 'WebSocketWrapper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCommentSlash, faUserSlash } from '@fortawesome/free-solid-svg-icons';

import { IUser, IChannelUser, IChannel } from './interface';
import { Socket } from 'socket.io-client';
import { parseEvent } from './ChatPage';

interface AdminProps {
    currentChannel : IChannel;
    socket: Socket;
}

export default function AdminPanel(props: AdminProps) {
    const login = useContext(getLoginContext);
    const [state, setState] = useState<{login: string, type: string}>({login: "", type: ""});
    const [error, setError] = useState<string>("");

    let timestamp: HTMLInputElement | null = null;

    useEffect(() => {
      setError("");
      props.socket.on('error', (data) => {
        const err = parseEvent(data);
        if (err === null)
          return ;
        if (err.type === "setPermissions")
          setError(err.error);
        else
          setError("");
        console.log(data, "[" + err.type + "]", err.error);
      });

      return (() => {
        props.socket.off('error');
      });
    }, [props.socket]);

    function isAdmin(users: IChannelUser[]) : boolean {
      const user = users.find((element: any) => element.user.ft_login === login.value);

      if (user === undefined)
        return false;
      return user.rights === "Owner" || user.rights === "Admin"
    }

    const setPermissionsUser = (user: IChannelUser, type: string) => (e: any) => {
      e.preventDefault();

      const updated_user = user;
      const time = new Date();

      if (type === "Kicked")
        updated_user.status = null;
      else if (state.type !== "") {
        time.setSeconds(time.getSeconds() + (parseInt(timestamp!.value) * 60));
        updated_user.rights = state.type === "ban" ? "Banned" : "Muted";
        updated_user.rightsEnd = time;
      }
      else
        return ;

      props.socket.emit('setPermissions', updated_user, () => {
        setState({login: "", type: ""});
      });
    }

    function invertState(login: string, type: string) {
      const obj = {login: "", type: ""};

      if (state.type !== type) {
        obj.login = login;
        obj.type = type;
      }

      setState(obj);
    }

    if (!isAdmin(props.currentChannel.users))
      return (null);

    return (
      <>
        <h1
          style={{
            textAlign: "center"
          }}
        >
          Administrator Panel
        </h1>
        {props.currentChannel.users.map((data, index) => {
          const user : IUser = data.user;
          return (
            <div key={index}>
                <p style={{
                  textAlign: "center"
                }}
                >
                  {user.username}</p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                  >
                <Button
                  icon={<FontAwesomeIcon icon={faCommentSlash} />}
                  title="Mute user"
                  onClick={() => invertState(user.ft_login, "mute")}
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
                  onClick={() => invertState(user.ft_login, "ban")}
                  >
                    Ban
                </Button>
                {state.login === user.ft_login ?
                  <form onSubmit={setPermissionsUser(data, "")}>
                    <input
                      type="number"
                      min="1"
                      placeholder={state.type + " time in minutes"}
                      ref={node => timestamp = node}
                      required
                    />
                    <button>click click</button>
                  </form>
                :
                  <></>
                }
                </div>
              </div>
          )
        })}
        <p className='error'>{error}</p>
      </>
    );
  }