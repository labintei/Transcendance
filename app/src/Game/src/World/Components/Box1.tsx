import React, { RefObject, useEffect, useRef, useState } from "react"
import { useFrame } from '@react-three/fiber'
import { useSpring, animated, config } from '@react-spring/three'
import { useStore } from '../../State/state'

import { socket } from '../../PongGame'

export default function Box1(props: JSX.IntrinsicElements['mesh'] | any) {


  // This reference will give us direct access to the THREE.Mesh object
  // const ref = useRef<any>(null!)

  // tie ship and camera ref to store to allow getting at them elsewhere
  const box = useStore((s: any) => s.box1)
  const color = useStore((s: any) => s.padColor)

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [active, setActive] = useState(false);

  const myMesh = React.useRef() as RefObject<any>;

  
  const getDirection: any = useStore((state: any) => state.controls);

  const player1move:any = useStore((s:any) => s.Player1)
  const data = useStore((s:any) => s.player1_x);

  
  useEffect(() => { 
    //socket.on('box1_x', (data) => {console.log('box1' + String(data));player1move(data)});
    
    socket.on('box1_x', (data) => {console.log(String(data));player1move(data)});//recoit des 1 ...
    return () => {
    }
  }, [player1move])
  

  useFrame((state, delta) => {
    box.current.position.x = data;
  })

  const { scale } = useSpring({
    scale: active ? 1.2 : 1,
    config: config.wobbly
  });

//TODO: make a 180° rotation x 
  return (
    <animated.mesh
      scale={scale}
      onClick={() => setActive(!active)}
      ref={myMesh}
      >
      <mesh
        {...props}
        ref={box}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
        rotation={[0, 0, 0]}
        >
        <boxGeometry args={[2, 0.5, 1]
        } 
        
        />
        <meshStandardMaterial color={hovered ? 'royalblue' : color} />
      </mesh>

    </animated.mesh>
  );
  // )
}