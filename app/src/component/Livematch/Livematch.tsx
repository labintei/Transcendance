import './Livematch.css';
import World from './World/World';
import {useStore} from './State/state';
import { socket } from '../../App' ;
import { useState } from 'react';
import React, { useEffect } from 'react';

export default function Livematch(props:any){
  // Array<[number,string,string]>
    const [roomList,setRoomList] = useState([])
    // One Time
    useEffect(() => {
    
      console.log('ONCE');
      socket.emit('getlist');
      //socket.emit('startstream', 0);
      return () => {
        socket.off('get_first');
        socket.disconnect();
      }
    }, [])

    var B:any = useStore((s:any)=> s.Player1);
    var C:any = useStore((s:any)=> s.Player2);
    const Setx:any = useStore((s:any)=> s.Setx);
    const Setz:any = useStore((s:any) => s.Setz);
    const startStream = function(ev:any){
      console.log(ev.target)
      console.log(ev.target.getAttribute("data-roomid"))
      socket.emit("startstream", ev.target.getAttribute("data-roomid") * 1)
    }
    useEffect(() => {

      socket.on('getlist', (data) => {
        console.log('DATA ');
        console.log(data)
        if(data && data.length){
          console.log(data[0]);// va me sortir ma premiere salle
          setRoomList(data);
        }
        // probleme renvoit un array 0
      });
      //socket.on(get_stream)
      socket.on('pos', (data) => {
        Setx(data[0]);
        Setz(data[1]);
        B(data[2]);
        C(data[3])
      })

      return () => {

      }

    }, [B,C,Setx,Setz])
  
      return (
      <div className="App" tabIndex={0} >
      {<World/>}
      <div className='menuContainer'>
        {roomList.length && roomList.map((rom) => { 
          return <div className="btnMatch" key={rom[0]} data-roomid={rom[0]} onClick={startStream}>
          {rom[1]} - {rom[2]}
        </div>
      })}
      </div>
      </div>
      )
}
  // Intersting icon
  //https://www.iconfinder.com/icons/103676/path_icon
