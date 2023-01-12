import axios from 'axios';
import './Livematch.css';
import World from './World/World';
import {useStore} from './State/state';
import { socket } from '../../App' ;
import React, { useEffect } from 'react';

export default function Livematch(props:any){

    // One Time
    useEffect(() => {
    
      console.log('ONCE');
      socket.emit('getlist');
      socket.emit('startstream', 0);
      return () => {
        socket.off('get_first');
        socket.disconnect();
      }
    }, [])

    var B:any = useStore((s:any)=> s.Player1);
    var C:any = useStore((s:any)=> s.Player2);
    const Setx:any = useStore((s:any)=> s.Setx);
    const Setz:any = useStore((s:any) => s.Setz);

    useEffect(() => {

      socket.on('get_list', (data) => {
        console.log('DATA ');
        console.log(data)
        if(data)
          console.log(data[0]);// va me sortir ma premiere salle
      });
      //socket.on(get_stream)
      socket.on('pos', (data) => {console.log('POS ');console.log(data);Setx(data[0]);Setz(data[1]);B(data[2]);C(data[3])})

      return () => {

      }

    }, [])
  
      return (
      <div className="App" tabIndex={0} >
      {<World/>}
      <div className='menuContainer'>
        {['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'].map((div) => { return <div className="btnMatch" key={div}>user 1 - user 2</div>})}
      </div>
      </div>
      )
}
  // Intersting icon
  //https://www.iconfinder.com/icons/103676/path_icon
