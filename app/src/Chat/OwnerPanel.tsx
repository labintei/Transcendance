import { useContext, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {
  Button,
} from '@chatscope/chat-ui-kit-react';
import { getLoginContext } from 'WebSocketWrapper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faKey, faLock, faLockOpen, faPen, faXmark } from '@fortawesome/free-solid-svg-icons';

import { IChannel } from './interface';
import { Socket } from 'socket.io-client';

interface OwnerProps {
    currentChannel : IChannel;
    socket: Socket;
}

export default function OwnerPanel(props: OwnerProps) {
    const [edit, setEdit] = useState<string>("");

    let name: HTMLInputElement | null = null;
    let password: HTMLInputElement | null = null;
    let new_admin: HTMLInputElement | null = null;

    const login = useContext(getLoginContext);

    const updateName = (e: any) => {
      e.preventDefault();

      console.log("hiya2");

      const updatedChannel = props.currentChannel;

      updatedChannel.name = name!.value;

      props.socket.emit('updateChannel', updatedChannel);
    }

    const updatePassword = (e: any) => {
      e.preventDefault();

      const updatedChannel = props.currentChannel;

      if (password === null)
        return ;
      if (password.value !== "") {
        updatedChannel.password = password.value;
        updatedChannel.status = "Protected";
      }
      else {
        updatedChannel.status = "Public";
      }

      props.socket.emit('updateChannel', updatedChannel, () => {
        setEdit("");
      });
    }

    const setAdmin = (mode: string) => (e: any) => {
      e.preventDefault();
      
      const updated_user = props.currentChannel.users.find(element => element.userLogin === new_admin!.value);

      if (updated_user === undefined) {
        new_admin!.value = "";
        return ;
      }

      if (mode === "add") {
        updated_user.rights = "Admin";
      }
      else if (updated_user.rights !== "Admin") {
          console.error("User is not an admin");
          return ;
      }
      else
        updated_user.rights = null;

      props.socket.emit('setPermissions', updated_user, () => {
        new_admin!.value = "";
      });
    }

    const lockChannel = (status: boolean) => (e: any) => {
      e.preventDefault();

      const updatedChannel = props.currentChannel;

      updatedChannel.status = status ? "Private" : "Public";
      props.socket.emit('updateChannel', updatedChannel);
    }

    function isOwner(users: any) : boolean {
      const owner = users.find((element: any) => element.rights === "Owner")
  
      return owner.user.ft_login === login.value;
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
              <Button
                // type="button"
                icon={<FontAwesomeIcon icon={faXmark}/>}
                onClick={() => setEdit("")}
              >
                Cancel
              </Button>
            </form>

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

              <Button
                icon={<FontAwesomeIcon icon={faXmark}/>}
                onClick={() => setEdit("")}
                >
                  Cancel
              </Button>
            </form>

          </>
        }

        <h2>Edit administrators</h2>
        <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="input"
                placeholder="Insert login"
                ref={node => new_admin = node}
                required
              />

              <Button onClick={setAdmin("add")}
                icon={<FontAwesomeIcon icon={faCheck}/>}
              >
                Add
              </Button>

              <Button
                onClick={setAdmin("del")}
                icon={<FontAwesomeIcon icon={faXmark}/>}
              >
                Remove
              </Button>
            </form>
      </>
    );
  }