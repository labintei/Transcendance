import { useRef, useState } from "react"
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  CubeCamera,
  WebGLCubeRenderTarget,
  RGBAFormat,
  LinearMipmapLinearFilter,
  TextureLoader,
} from "three";
import { useStore } from "../../State/state";
import * as THREE from 'three'
import pv_color from "../Textures/Marble/Marble006_1K_Color.png"
import pv_dipl from "../Textures/Marble/Marble006_1K_Displacement.png"
import pv_norm from "../Textures/Marble/Marble006_1K_NormalDX.png"
import pv_rough from "../Textures/Marble/Marble006_1K_Roughness.png"



export default function Plane(props: JSX.IntrinsicElements['mesh']) {

  const map = useStore((s: any) => s.bgdChoice)

  const [colorMap, normalMap, roughnessMap] =
    useLoader(TextureLoader, [
      pv_color,
      pv_dipl,
      pv_norm,
      pv_rough,
    ])

  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!)
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame((state, delta) => (ref.current.rotation.x += 0.01))

  const { scene, gl } = useThree();
  // The cubeRenderTarget is used to generate a texture for the reflective sphere.
  // It must be updated on each frame in order to track camera movement and other changes.
  const cubeRenderTarget = new WebGLCubeRenderTarget(256, {
    format: RGBAFormat,
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter,
  });
  // CubeCamera to observe the surrounding scene in all 
  // directions, pipe that in to a RenderTarget which will result in a TextureCube containing the current surroundings
  const cubeCamera = new CubeCamera(1, 1000, cubeRenderTarget);
  cubeCamera.position.set(0, 100, 0);
  scene.add(cubeCamera);
  // Update the cubeCamera with current renderer and scene.
  useFrame(() => cubeCamera.update(gl, scene));
  const color_choose = new THREE.Color('rgb(55,6,73)');
  return (
    // <PivotControls>
    <>
      { map === 0 &&
        <mesh
          {...props}
          ref={ref}
          //   scale={clicked ? 1.5 : 1}
          onClick={(event) => click(!clicked)}
          onPointerOver={(event) => hover(true)}
          onPointerOut={(event) => hover(false)}>
          <boxGeometry args={[10, 0.5, 10]} />
          <meshBasicMaterial
            color={color_choose} 
            attach="material"
            // mirror effect
            // envMap={cubeCamera.renderTarget.texture}
          />
        </mesh>
      }
      {map === 1 &&
        <mesh
          {...props}
        >
          <boxGeometry args={[10, 0.5, 10]} />
          <meshStandardMaterial
            map={colorMap}
            // displacementScale={0.2}
            // displacementMap={displacementMap}
            normalMap={normalMap}
            roughnessMap={roughnessMap}
          />
        </mesh>
      }
      </>
  )
}