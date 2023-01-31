import { useEffect, useState , useContext} from 'react';
import './PongGame.css';
import World from './World/World';
import {useStore} from './State/state';
import Menu from './Menu/menu';
import { getSocketContext } from 'WebSocketWrapper';
import { useParams } from 'react-router-dom';

export default function PongGame(props: any) {

  const socket = useContext(getSocketContext);
  let {matchid} = useParams();

  const [Finish, setFinish] = useState(0);
  const [message, setMessage] = useState("Waiting for your opponent...");

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
  const Ready:any = useStore((s:any) => s.gameReady);
  const SetReady:any = useStore((s:any) => s.SetReady);

  var v:any = useStore((s:any) => s.setbis);
  var vbis:number = useStore((s:any) => s.t);

  const h1:any = useStore((s:any) => s.Setcx);
  const h2:any = useStore((s:any) => s.Setcy);
  const h3:any = useStore((s:any) => s.Setcz);


  useEffect(() => 
  {
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
      console.log(data[1]);
      console.log(data[1] === 1);
      console.log(data[1] == 1);
      if(data[1] === 1)
      {
        h1(0);
        h2(3);
        h3(7);
      }
      else
      {
        h1(0);
        h2(5);
        h3(-9);
      }
      setMessage(data[2][0] + " VS " + data[2][1])
    })
    return () => {
      socket.off('start');
      socket.emit('endgame');// reteste
      SetReady(false);
    }
  }, [h1,h2,h3,SetReady,setId, setRole, socket])


  useEffect(() => {
    socket.on('newpos', (data) => {
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
  },[B,C,Setx,Setz,score1,score2,vbis,v,socket])

  useEffect(() => {
    socket.on('Not_Exist', () => setMessage("This game does not exist !"));
    return () => {
      socket.off('Not_Exist')
    }
  }, [socket])


  useEffect(() => {
    socket.on('Ended_game', () => {setMessage("This game is over.")});
    socket.on('endgame', () => {console.log('END');setFinish(1); setMessage("This game is over.")});
    return () => {
      socket.off('endgame');
      socket.off('Ended_game');
    }
  },[setFinish,socket])

  const restartGame = function(){
    setFinish(0);
    socket.emit('start_game');
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
      Params:
      <div>{matchid}</div>
      Name:
     
    </div>
    </div>
    <div className={'endGameContainer ' + (Finish ? "showEndGame" : "")}>
      <h2>{s} - {sbis}</h2>
      {
        s > sbis ? <p>You Won !</p> : <p>You lost...</p>
      }
      <div className='btnRestartGame' onClick={restartGame}>
        Rejouer
      </div>
    </div>
    {/*<Menu/>*/} 
    </div>
    );
}

