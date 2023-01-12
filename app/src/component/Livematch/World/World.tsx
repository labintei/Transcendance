/* eslint-disable */
import { CubeTextureLoader } from "three";
import * as THREE from 'three'
import * as React from 'react'
import { useRef, useState } from 'react'
import { Canvas, useFrame, extend, useThree, useLoader, } from '@react-three/fiber'
import Box from './Components/Box1'
import Plane from './Components/Plane'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ReactThreeFiber } from '@react-three/fiber'
import Sphere from './Components/Sphere'
import i1 from "../World/Components/Skybox/corona_ft.png"
import i2 from "../World/Components/Skybox/corona_bk.png"
import i3 from "../World/Components/Skybox/corona_up.png"
import i4 from "../World/Components/Skybox/corona_dn.png"
import i5 from "../World/Components/Skybox/corona_rt.png"
import i6 from "../World/Components/Skybox/corona_lf.png"

import { useStore } from "../State/state";
import Box1 from "./Components/Box1";
import Box2 from "./Components/Box2";
import { Cloud, Sky, Sparkles } from "@react-three/drei";
import { Water } from "three/examples/jsm/objects/Water.js";
import waterimg from "./Textures/waternormals.png"

//import SocketControl from "../ChangeState/ChangeState";


// Extend will make OrbitControls available as a JSX element called orbitControls for us to use.
extend({ OrbitControls });
extend({ Water });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
    }
  }
}

function Ocean() {
  const ref: any = useRef()
  const gl = useThree((state) => state.gl)
  const waterNormals = useLoader(THREE.TextureLoader, waterimg)
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
  const geom = React.useMemo(() => new THREE.PlaneGeometry(10000, 10000), [])
  const config = React.useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: false,
      // @ts-ignore
      format: gl.encoding
    }),
    [waterNormals]
  )

  console.log(ref)
  useFrame((state, delta) => (ref.current.material.uniforms.time.value += delta))
  // @ts-ignore
  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} position={[0, -5, 0]} />
}

// TODO: lock zoom and unzoom
const CameraControls = () => {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls component.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls

  // 1. Using the useThree Hook to get a reference to the Three.JS Camera and Canvas Element
  const {
    camera,
    gl: { domElement },
  } = useThree();

  // 2. Plugging The Orbit Controls into the render loop with useFrame
  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls: any = useRef();
  useFrame((state) => controls.current.update());
  // 3. Initializing the Orbit Control
  return <orbitControls
    ref={controls}
    args={[camera, domElement]}
    // enableZoom={false}
    /*
    maxAzimuthAngle={Math.PI / 4}
    maxPolarAngle={Math.PI}
    minAzimuthAngle={-Math.PI / 4}
    minPolarAngle={0}*/
    enableDamping={true}
  />;
};

// Loads the skybox texture and applies it to the scene.
function SkyBox() {
  const { scene } = useThree();
  const loader = new CubeTextureLoader();
  // The CubeTextureLoader load method takes an array of urls representing all 6 sides of the cube.
  const texture = loader.load([
    i1,
    i2,
    i3,
    i4,
    i5,
    i6
    //   "https://6izyu.csb.app/3.jpg",
    //   "https://6izyu.csb.app/4b.jpg",
    //   "https://6izyu.csb.app/4.jpg",
    //   "https://6izyu.csb.app/5.jpg",
    //   "https://6izyu.csb.app/2.jpg",
  ]);
  // Set the scene background property to the resulting texture.
  scene.background = texture;
  return null;
}

// changer la position de la Camera si role === 2


export default function World(props: any) {

  var camposx = useStore((s:any) => s.cx);
  var camposy = useStore((s:any) => s.cy);
  var camposz = useStore((s:any) => s.cz);

  const map = useStore((s: any) => s.bgdChoice)
  return (
    <Canvas
    camera={{ position: [camposx, camposy, camposz]}}>
    <CameraControls />
    <ambientLight intensity={0.5} />
    <directionalLight position={[0, 0, 5]} color="red" />
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
    <pointLight position={[-10, -10, -10]} />
    <Box1 position={[0, 0, 5]} />
    <Sphere />

    { map === 0 && 
    <SkyBox /> 
    }
    { map === 1 &&
    <>
    <Ocean />
     <Sky
      sunPosition={[0, 1, 8]}
      inclination={10}
      azimuth={125}
      rayleigh={60}
      turbidity={100}
      mieCoefficient={0.1}
      mieDirectionalG={0.8}
      distance={3000}
      {...props}
    />
    </>

    }

    <Box2 position={[0, 0, -5]} />
    <Plane position={[0, -0.5, 0]} />
  </Canvas>
  )

}