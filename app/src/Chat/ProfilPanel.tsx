import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {
  AddUserButton,
  Avatar,
  Button,
} from '@chatscope/chat-ui-kit-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faUser, faUserMinus, faUserSlash } from '@fortawesome/free-solid-svg-icons';

import { IUser, IChannel } from './interface';
import { Socket } from 'socket.io-client';
import axios from 'axios';
import { backend_url_block, backend_url_friend } from './ChatPage';
import { useNavigate } from 'react-router-dom';

interface ProfilProps {
    user : IUser;
    socket: Socket;
    setCurrent: any,
    relations: {friends: IUser[], blocked: IUser[]},
    setRelations: any,
}

export default function ProfilPanel(props: ProfilProps) {
  const navigate = useNavigate();

  function getRelations() {
    axios.all([
      axios.get(backend_url_block, {
        withCredentials: true
      }),
      axios.get(backend_url_friend, {
        withCredentials: true
      })
    ])
    .then(axios.spread((rec1, rec2) => {
      props.setRelations({
        blocked: rec1.data,
        friends: rec2.data,
      })
    }))
    .catch((rec) => {
      console.log("error request", rec);
    })
  }

  const blockUser = (user: IUser) => (e: any) => {
    e.preventDefault();
    console.log(backend_url_block + user.username);
    axios.put(backend_url_block + user.username, {}, {
      withCredentials: true
    }).then((rec) => {
      getRelations();
    }).catch((rec) => {
      console.log(rec);
    })
  }

  const unblockUser = (user: IUser) => (e: any) => {
    e.preventDefault();
    console.log(backend_url_block + user.username);
    axios.delete(backend_url_block + user.username, {
      withCredentials: true
    }).then((rec) => {
      getRelations();
    }).catch((rec) => {
      console.log(rec);
    })
  }

  function isBlocked(username: string) : boolean {
    const user = props.relations.blocked.find(user => user.username === username);
    return (user !== undefined)
  }

  const friendUser = (user: IUser) => (e: any) => {
    e.preventDefault();
    console.log(backend_url_friend + user.username);
    axios.put(backend_url_friend + user.username, {}, {
      withCredentials: true
    }).then((rec) => {
      getRelations()
    }).catch((rec) => {
      console.log(rec);
    })
  }

  const unfriendUser = (user: IUser) => (e: any) => {
    e.preventDefault();
    console.log(backend_url_friend + user.username);
    axios.delete(backend_url_friend + user.username, {
      withCredentials: true
    }).then((rec) => {
      getRelations()
    }).catch((rec) => {
      console.log(rec);
    })
  }
  
  function isFriend(username: string) : boolean {
    const user = props.relations.friends.find(user => user.username === username);
    return (user !== undefined)
  }

  const joinDirectChannel = (e: any) => {
    e.preventDefault();

    props.socket.emit('getDirectChannel', props.user, (data: IChannel) => {
      props.setCurrent(data);
      props.socket.emit('directList');
    })

  }

  const challenge = (username: string) => (e: any) => {
    e.preventDefault();
    axios.put(process.env.REACT_APP_BACKEND_URL + "match/" + username, {}, {
      withCredentials:true
    }).then(res => {
      if (res.data !== undefined)
        navigate("../game/" + res.data);
    }).catch(error => {
      if (error.response.status === 401 || error.response.status === 403)
        navigate("../login");
    });
  }

  return (
    <>
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
        }}>
        <div style={{
          width: "100px",
          height: "100px",
          }}>
          <Avatar src={props.user.avatarURL} name={props.user.username} size="fluid" />
        </div>
        <h2>
          {props.user.username}'s profile
        </h2>
        <div style={{
          display: "flex",
          flexDirection: "row",
          }}>
          {!isFriend(props.user.username) ?
            <AddUserButton
            style={{fontSize: "1.4em"}}
            title="Add this person as a friend"
            onClick={friendUser(props.user)}
            />
          :
            <Button
              style={{fontSize: "1.4em"}}
              icon={<FontAwesomeIcon icon={faUserMinus}/>}
              title="Unfriend this person"
              onClick={unfriendUser(props.user)}
              />
          }
          {!isBlocked(props.user.username) ?
            <Button
              style={{fontSize: "1.4em"}}
              icon={<FontAwesomeIcon icon={faUserSlash}/>}
              title="Block this person"
              onClick={blockUser(props.user)}
              />
          :
            <Button
              style={{fontSize: "1.4em"}}
              icon={<FontAwesomeIcon icon={faUser}/>}
              title="Unblock this person"
              onClick={unblockUser(props.user)}
              />
          }
        </div>
        <Button
          // style={{fontSize: "1.4em"}}
          icon={<FontAwesomeIcon icon={faGamepad}/>}
          title="Challenge this person"
          onClick={challenge(props.user.username)}
          >
          Invite to game
        </Button>
        <Button onClick={joinDirectChannel}>
          Private message
        </Button>

      </div>
    </>
  );
}