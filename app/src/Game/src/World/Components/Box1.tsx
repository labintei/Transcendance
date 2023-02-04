import React, { RefObject, useState } from "react"
import { useFrame } from '@react-three/fiber'
import { useSpring, animated, config } from '@react-spring/three'
import { useStore } from '../../State/state'

export default function Box1(props: JSX.IntrinsicElements['mesh'] | any) {

  const box = useStore((s: any) => s.box1)
  const color = useStore((s: any) => s.padColor)

  const [hovered, hover] = useState(false)
  const [active, setActive] = useState(false);

  const myMesh = React.useRef() as RefObject<any>;

  const g = useStore((state:any) => state.p1x);

  useFrame(() => {

    box.current.position.x = g;
})

  const { scale } = useSpring({
    scale: active ? 1 : 1,
    config: config.wobbly
  });

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