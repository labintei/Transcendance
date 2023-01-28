import { useContext, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {
  Button,
} from '@chatscope/chat-ui-kit-react';
import { getLoginContext } from 'WebSocketWrapper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faKey, faLock, faLockOpen, faPen, faXmark } from '@fortawesome/free-solid-svg-icons';

import { tUser, tChannel } from './ChatPage';
import { Socket } from 'socket.io-client';

interface OwnerProps {
    currentChannel : tChannel;
    socket: Socket;
}

export default function OwnerPanel(props: OwnerProps) {
    const [edit, setEdit] = useState<string>("");

    let name: HTMLInputElement | null = null;
    let password: HTMLInputElement | null = null;

    const login = useContext(getLoginContext);

    const updateName = (e: any) => {
      e.preventDefault();

      const updatedChannel = props.currentChannel;

      updatedChannel.name = name!.value;

      props.socket.emit('updateChannel', updatedChannel);
    }

    const updatePassword = (e: any) => {
      e.preventDefault();

      const updatedChannel = props.currentChannel;

      updatedChannel.password = password ? password.value : "";
      updatedChannel.status = "Protected";

      props.socket.emit('updateChannel', updatedChannel);
    }

    const lockChannel = (status: boolean) => (e: any) => {
      e.preventDefault();

      const updatedChannel = props.currentChannel;

      updatedChannel.status = status ? "Private" : "Public";
      props.socket.emit('updateChannel', updatedChannel);
    }

    function isOwner(users: any) : boolean {
      const owner = users.find((element: any) => element.rights === "Owner")
  
      return owner.user.ft_login == login.value;
    }

    if (!isOwner(props.currentChannel.users))
      return (null);

    return (
      <>
        {edit !== "name" ? 
          <>
            <h1>
              {props.currentChannel.name}
            </h1>
            <Button
              icon={<FontAwesomeIcon icon={faPen}/>}
              onClick={() => setEdit("name")}
            >
            Change Name
            </Button>
          </>
        :
        <>
          <form onSubmit={updateName}>
            <input
              type="input"
              placeholder="Enter new channel name..."
              ref={node => name = node}
              required
            />

            <Button
              icon={<FontAwesomeIcon icon={faCheck}/>}
            >
              Validate
            </Button>
          </form>
            <Button
            icon={<FontAwesomeIcon icon={faXmark}/>}
            onClick={() => setEdit("")}
            >
              Cancel
            </Button>
          </>
        }

        {props.currentChannel.status !== "Private" ? 
          <Button
            icon={<FontAwesomeIcon icon={faLock}/>}
            onClick={lockChannel(true)}
          >
            Lock Channel
          </Button>
          :
          <Button
            icon={<FontAwesomeIcon icon={faLockOpen}/>}
            onClick={lockChannel(false)}
          >
            Unlock Channel
          </Button>
        }

        {edit !== "password" ?
          <Button
            icon={<FontAwesomeIcon icon={faKey}/>}
            onClick={() => setEdit("password")}
            >
            Change Password
          </Button>
        :
        <>
          <form onSubmit={updatePassword}>
            <input
              type="input"
              placeholder="Enter password"
              ref={node => password = node}
            />

            <Button
              icon={<FontAwesomeIcon icon={faCheck}/>}
            >
              Validate
            </Button>
          </form>
            <Button
            icon={<FontAwesomeIcon icon={faXmark}/>}
            onClick={() => setEdit("")}
            >
              Cancel
            </Button>
          </>
        }
      </>
    );
  }