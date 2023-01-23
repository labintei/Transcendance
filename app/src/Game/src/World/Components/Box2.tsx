import React, { RefObject, useState } from "react"
import { useFrame } from '@react-three/fiber'
import { useSpring, animated, config } from '@react-spring/three'
import { useStore } from '../../State/state'

export default function Box2(props: JSX.IntrinsicElements['mesh'] | any) {

  // This reference will give us direct access to the THREE.Mesh object
  // const ref = useRef<any>(null!)

  // tie ship and camera ref to store to allow getting at them elsewhere
  const box = useStore((s: any) => s.box2)
  const color = useStore((s: any) => s.padColor)

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [active, setActive] = useState(false);

  const myMesh = React.useRef() as RefObject<any>;

  const data = useStore((s:any) => s.p2x);

  // va l envoyer en double pas bon bail
  useFrame(() => {
    box.current.position.x = data / 10;
  })

  const { scale } = useSpring({
    scale: active ? 1.2 : 1,
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
        onPointerOut={() => hover(false)}>
        <boxGeometry args={[2, 0.5, 1]} />
        <meshStandardMaterial color={hovered ? 'royalblue' : color} />
      </mesh>

    </animated.mesh>
  );
  // )
}