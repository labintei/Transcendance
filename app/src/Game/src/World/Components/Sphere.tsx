import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "../../State/state";


export default function Sphere() {
  
  const ref = useRef<any>(null!)
  const ballcolor:any = useStore((state:any) => state.ballColor);

  const A = useStore((state:any) => state.sphere_x);
  const B = useStore((state:any) => state.sphere_z);

  useFrame(() => { 
      ref.current.position.x = A;
      ref.current.position.z = B;
  })
  return (
    <mesh visible position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow
    ref={ref}>
      <sphereGeometry attach="geometry" args={[0.25, 24, 24]} />
      <meshBasicMaterial
        attach="material"
        color={ballcolor}
      />
    </mesh>
  );
}
