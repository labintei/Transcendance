import { useEffect, useState , useContext} from 'react';
import './PongGame.css';
import World from './World/World';
import {useStore} from './State/state';
import { getLoginContext, getSocketContext } from 'WebSocketWrapper';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function PongGame(props: any) {

  const navigate = useNavigate();
  const socket = useContext(getSocketContext);
  let {matchid} = useParams();


  const [Finish, setFinish] = useState(0);
  const [message, setMessage] = useState("Waiting for your opponent...");
  const [Usernames, setUsernames] = useState(["",""]);

  // On va specifier si il s agit d une INVITMenuATION/STREAM/GAME pour le menu de fin

  const [mode, Setmode] = useState("");  

  //const Spectator_mode:boolean = useStore((s:any)=> s.spectator);

  var B:any = useStore((s:any)=> s.Player1);
  var C:any = useStore((s:any)=> s.Player2);
  
  const role = useStore((s:any)=> s.role);

  const setRole:any = useStore((s:any)=> s.SetRole);
  const setId:any = useStore((s:any)=> s.SetId);

  const s:any = useStore((s:any) => s.s);
  const sbis:any = useStore((s:any) => s.sbis);
  const score1:any = useStore((s:any) => s.setscore);
  const score2:any = useStore((s:any) => s.setscorebis);

  const Setx:any = useStore((s:any) => s.Setx);
  const Setz:any = useStore((s:any) => s.Setz);
  const SetReady:any = useStore((s:any) => s.SetReady);

  var v:any = useStore((s:any) => s.setbis);
  var vbis:number = useStore((s:any) => s.t);

  const h1:any = useStore((s:any) => s.Setcx);
  const h2:any = useStore((s:any) => s.Setcy);
  const h3:any = useStore((s:any) => s.Setcz);
/*
  useEffect(() =>{
    if (login.value === "")
      navigate("/login")
  }, [logged])*/

  useEffect(() => 
  {
    setFinish(0);
    if(matchid)
      socket.emit('start_invit_stream', matchid);
    else
      socket.emit('start_game');   
    return() => {}
  },[matchid, socket])

  useEffect(() => {
    socket.on('start', (data) => {
      setRole(data[1]);
      setId(data[0]);
      SetReady(true);
      if(data[1] === 1)
      {
        h1(0);
        h2(5);
        h3(9);
      }
      else
      {
        /*h1(0);
        h2(5);
        h3(-9);*/
        h1(0);
        h2(5);
        h3(-9);
      }
      if(data[2])
      {
        setUsernames([data[2][0], data[2][1]]);
        setMessage(data[2][0] + " VS " + data[2][1])
      }
    })
    return () => {
      socket.off('start');
      socket.emit('endgame');// reteste
      ResetState();
      SetReady(false);
    }
    // eslint-disable-next-line
  }, [h1,h2,h3,SetReady,setId, setRole, socket])

  useEffect(() => {
    socket.on('mode', (data) => {
      console.log(data[0]);
      Setmode(data[0]);
      console.log(mode);
      setUsernames([data[1][0], data[1][1]]);
      setMessage(data[1][0] + " VS " + data[1][1]);

    });
    return () => {
      socket.off('mode');
    }
  }, [mode, Setmode, socket])

  useEffect(() => {
    socket.on('newpos', (data) => {
      // console.log("POS DES BOX" + data[2] + data[3])
      if(vbis !== data[4])
        v(data[4]);
      Setx(data[0]);
      Setz(data[1]);
      B(data[2]);
      C(data[3]);
      if (role === 2) {
        score2(data[5]);
        score1(data[6])
      } else {
        score1(data[5]);
        score2(data[6])
      }
    });
    return () => {
      socket.off('newpos');
    }
  },[role, B,C,Setx,Setz,score1,score2,vbis,v,socket])

  useEffect(() => {
    socket.on('Not_Exist', () => setMessage("This game does not exist !"));
    return () => {
      socket.off('Not_Exist')
    }
    // eslint-disable-next-line
  }, [socket])


  useEffect(() => {
    socket.on('Ended_game', () => {setMessage("This game is over.")});
    socket.on('endgame', () => {setFinish(1); setMessage("This game is over.")});
    socket.on('endstream', () => {console.log("endstream");setFinish(1); setMessage("This game is over.")});
    return () => {
      socket.off('endgame');
      socket.off('endstream');
      socket.off('Ended_game');
    }
  },[setFinish,socket])

  /*
  function ResetState(){

  }*/

  function ResetState(){
    SetReady(false);
    setUsernames([""]);
    setMessage("Waiting for your opponent...");
    score1(0);score2(0);
    v(0);
  }


  function RestartButton(props:{mode:string, username:string}){
    let message:string = "Retour à l'acceuil"
    if (props.mode === "invitation") {
      message = "Rejouer";}
    else if (props.mode === "game"){
      message = "Rejoindre un nouveau match";}
    

    function createMatchAndRedirect() {
      axios.put(process.env.REACT_APP_BACKEND_URL + "match/" + props.username, {}, {
        withCredentials:true
      }).then(res => {
        if (res.data !== undefined)
          navigate("../game/" + res.data);
          window.location.reload();
      }).catch(error => {
        if (error.response.status === 401 || error.response.status === 403)
          navigate("../login");
        else
          window.location.reload();
      });
    } 
    
    return (
      <button className='btnRestartGame' onClick={() => {
        if (props.mode === "game") {
          navigate("/game");
          window.location.reload();
        } else if (props.mode === "invitation") {
          createMatchAndRedirect();
        } else if (props.mode === "stream") {
          navigate("/matching");
        }
      }}>
        {message}
      </button>
    )
  }


  return (
    <div className="App" tabIndex={0} >
    <World/>
    <div className='title'>
     {message}
    </div>
    <div className='score'>
      <div className='elem'>
      Time:
      <div>{vbis}</div>
      Score: 
      <div>{s} - {sbis}</div>
    </div>
    </div>
    <div className={'endGameContainer ' + (Finish ? "showEndGame" : "")}>
      <h2>{s} - {sbis}</h2>
      {
        mode === "stream" ?
          s > sbis ? <p>{Usernames[0]} Won !</p> : <p>{Usernames[1]} Won !</p>
        : s > sbis ? <p>You Won !</p> : <p>You lost...</p>
      }
      <RestartButton mode={mode} username={Usernames[role === 1 ? 1:0]}></RestartButton>
    </div>
    </div>
    );
}

