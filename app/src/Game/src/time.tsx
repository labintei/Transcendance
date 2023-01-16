
import React, { useCallback, useEffect, useState } from 'react';
import './PongGame.css';
import World from './World/World';
import {useStore} from './State/state';
import Menu from './Menu/menu';
import { socket } from '../../App' ;



export default function Timer(props:any) {

    const t:any = useStore((s:any) => s.time);
    const setT:any = useStore((s:any) => s.Otime);
    
    useEffect(() => {
        socket.on('time', (data) => {setT(data)})
  }, [setT]);

  /*  let t:any = useStore((s:any) => s.time);
    console.log('T'  + t);
*/
    return(
        <div>
            {t}
        </div>
    )
}
