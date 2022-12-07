import { useEffect } from 'react'
import { useStore } from '../State/state'
import { socket } from '../PongGame'

const pressed = [false]

function useKeys(target:any, event:any, up = true) {
  useEffect(() => {

    const downHandler = (e:any) => {
      if (target.indexOf(e.key) !== -1) {
        const isRepeating = !!pressed[e.keyCode]
        pressed[e.keyCode] = true
        if (up || !isRepeating) event(true)
      }
    }

    const upHandler = (e:any) => {
      if (target.indexOf(e.key) !== -1) {
        pressed[e.keyCode] = false
        if (up) event(false)
      }
    }

    window.addEventListener('keydown', downHandler, { passive: true })
    window.addEventListener('keyup', upHandler, { passive: true })
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [target, event, up])
}

export default function KeyBoardControls() 
{

  const data = useStore((s:any) => s.player1_x);
  //const box = useStore((s: any) => s.box2)
  useKeys(['ArrowLeft', 'a', 'A'], (left:boolean) => 
  {/*
    if(left)
      socket.emit('left', data);*/
    //else
      //socket.emit('end_left', useStore((s:any) => s.data.player1_x));
  })

  useKeys(['ArrowRight', 'd', 'D'], (right:boolean) =>
  { 
    /*if(right)
      socket.emit('right', data)
    */
    //else
      //socket.emit('end_right')

  })

  useKeys(['Escape'], (escape:boolean) =>
  {
      /*if(escape)
        socket.emit('escape')*/
  })

  return null;
}



/*export default function KeyboardControls() {
  const set = useStore((state: any) => state.set)
*/
  
  /*useKeys(['ArrowLeft', 'a', 'A'], (left:boolean)) => set((state:any) )
  {
      if(left === true)
        socket.emit('left')
      else
        socket.emit('end_left');
  }*/
//   @ts-ignore
/*  useKeys(['ArrowRight', 'd', 'D'], (right:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, right } })))

  useKeys(['Escape'], (escape:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, escape } })))
  return null
}*/