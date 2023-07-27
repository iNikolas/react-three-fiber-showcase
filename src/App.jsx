import React from 'react'
import * as THREE from 'three'
import { Stats, useScroll, Loader, ScrollControls, Sky, Center } from '@react-three/drei'
import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { getProject, val } from '@theatre/core'
import { SheetProvider, PerspectiveCamera, useCurrentSheet } from '@theatre/r3f'

import animatedCameraState from './animated-camera-state.json'

const humanSkinColor = '#FC9'
const floorSize = 1000
const sunPosition = [10, 60, 200]
const crosshairThreshold = 40
const crosshairColor = 'orange'
const crosshairWidth = 0.1
const crosshairPadding = 0.3
const crosshairPeripheryLineLength = 10000

function Crosshair({ target }) {
  const crossHairRef = React.useRef(null)

  const targetMesh = target.children[0]
  const targetMeshHeight =
    (targetMesh.geometry.boundingBox.max.z - targetMesh.geometry.boundingBox.min.z) * targetMesh.scale.z
  const crosshairSize =
    Math.max(targetMesh.geometry.boundingSphere.radius * targetMesh.scale.z, targetMeshHeight) + crosshairPadding

  useFrame(({ camera }) => {
    if (crossHairRef) {
      crossHairRef.current.rotation.x = camera.rotation.x
      crossHairRef.current.rotation.y = camera.rotation.y
      crossHairRef.current.rotation.z = camera.rotation.z
    }
  })

  const geometry = React.useMemo(() => {
    const rectShape = new THREE.Shape()
      .moveTo(-(crosshairSize + crosshairWidth) / 2, -(crosshairSize + crosshairWidth) / 2)
      .lineTo((crosshairSize + crosshairWidth) / 2, -(crosshairSize + crosshairWidth) / 2)
      .lineTo((crosshairSize + crosshairWidth) / 2, (crosshairSize - crosshairPadding) / 2)
      .lineTo(-(crosshairSize + crosshairWidth) / 2, (crosshairSize - crosshairPadding) / 2)
      .lineTo(-(crosshairSize + crosshairWidth) / 2, -(crosshairSize + crosshairWidth) / 2)

    const hole = new THREE.Path()
      .moveTo(-crosshairSize / 2, -crosshairSize / 2)
      .lineTo(crosshairSize / 2, -crosshairSize / 2)
      .lineTo(crosshairSize / 2, (crosshairSize - crosshairPadding - crosshairWidth) / 2)
      .lineTo(-crosshairSize / 2, (crosshairSize - crosshairPadding - crosshairWidth) / 2)
      .lineTo(-crosshairSize / 2, -crosshairSize / 2)

    rectShape.holes.push(hole)

    return new THREE.ExtrudeGeometry(rectShape, {
      depth: 0,
      bevelEnabled: false
    })
  }, [crosshairSize])

  return (
    <mesh
      ref={crossHairRef}
      position={[
        target.position.x,
        target.position.y + crosshairWidth * 2 + crosshairPadding + targetMeshHeight / 2,
        target.position.z
      ]}
      geometry={geometry}>
      <meshBasicMaterial color={crosshairColor} />
      <CrosshairPeripheryLines crosshairSize={crosshairSize} topOffset={crosshairWidth * 2} />
    </mesh>
  )
}

function CrosshairPeripheryLines({ crosshairSize, topOffset }) {
  const [topRef, setTopRef] = React.useState(null)
  const [bottomRef, setBottomRef] = React.useState(null)
  const [leftRef, setLeftRef] = React.useState(null)
  const [rightRef, setRightRef] = React.useState(null)

  React.useEffect(() => {
    if (topRef) {
      topRef.position.y += crosshairSize / 2 - topOffset
    }
  }, [topRef, crosshairSize, topOffset])

  React.useEffect(() => {
    if (bottomRef) {
      bottomRef.position.y -= crosshairSize / 2
    }
  }, [bottomRef, crosshairSize])

  React.useEffect(() => {
    if (leftRef) {
      leftRef.position.x -= crosshairSize / 2
    }
  }, [leftRef, crosshairSize])

  React.useEffect(() => {
    if (rightRef) {
      rightRef.position.x += crosshairSize / 2
    }
  }, [rightRef, crosshairSize])

  const verticalPoints = []
  verticalPoints.push(new THREE.Vector3(0, 0, 0))
  verticalPoints.push(new THREE.Vector3(0, crosshairPeripheryLineLength, 0))

  const horizontalPoints = []
  horizontalPoints.push(new THREE.Vector3(0, 0, 0))
  horizontalPoints.push(new THREE.Vector3(crosshairPeripheryLineLength, 0, 0))

  const verticalLineGeometry = new THREE.BufferGeometry().setFromPoints(verticalPoints)
  const horizontalLineGeometry = new THREE.BufferGeometry().setFromPoints(horizontalPoints)
  return (
    <>
      <Center top>
        <line ref={setTopRef} geometry={verticalLineGeometry}>
          <lineBasicMaterial attach="material" color={crosshairColor} />
        </line>
      </Center>
      <Center bottom>
        <line ref={setBottomRef} geometry={verticalLineGeometry}>
          <lineBasicMaterial attach="material" color={crosshairColor} />
        </line>
      </Center>
      <Center left>
        <line ref={setLeftRef} geometry={horizontalLineGeometry}>
          <lineBasicMaterial attach="material" color={crosshairColor} />
        </line>
      </Center>
      <Center right>
        <line ref={setRightRef} geometry={horizontalLineGeometry}>
          <lineBasicMaterial attach="material" color={crosshairColor} />
        </line>
      </Center>
    </>
  )
}

function Floor() {
  const texture = useLoader(THREE.TextureLoader, './img/TilePattern-n1_UR_1024.png')

  React.useEffect(() => {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(100, 100)
  }, [texture])

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <circleGeometry args={[floorSize, floorSize, floorSize]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function Model() {
  const [meshToOutline, setMeshToOutline] = React.useState(null)

  const { scene: human } = useLoader(GLTFLoader, './models/human.glb')
  const { scene: cat } = useLoader(GLTFLoader, './models/cat.glb')

  const sheet = useCurrentSheet()
  const scroll = useScroll()

  useFrame(({ camera }) => {
    const sequenceLength = val(sheet.sequence.pointer.length)
    sheet.sequence.position = scroll.offset * sequenceLength

    const cameraDistances = [
      [human, camera.position.distanceTo(human.position)],
      [cat, camera.position.distanceTo(cat.position)]
    ]

    const newMeshToOutline = cameraDistances.reduce(
      ([accMesh, accDistance], [mesh, distance]) =>
        accDistance < distance ? [accMesh, accDistance] : [mesh, distance],
      [null, crosshairThreshold]
    )[0]

    if (meshToOutline !== newMeshToOutline) {
      setMeshToOutline(newMeshToOutline)
    }
  })

  return (
    <>
      <primitive
        children-0-castShadow
        children-0-material-color={humanSkinColor}
        children-0-rotation-z={Math.PI / 5}
        object={human}
      />
      <primitive
        position={[30, 0, 15]}
        children-0-castShadow
        children-0-rotation-x={0}
        children-0-rotation-y={Math.PI / 4}
        children-0-scale={[0.2, 0.2, 0.2]}
        object={cat}
      />
      {meshToOutline && <Crosshair target={meshToOutline} />}
    </>
  )
}

export default function App() {
  const sheet = getProject('Fly Through', { state: animatedCameraState }).sheet('Scene')

  return (
    <>
      <Canvas gl={{ preserveDrawingBuffer: true }} shadows>
        <ScrollControls pages={4}>
          <SheetProvider sheet={sheet}>
            <Sky distance={4500} sunPosition={sunPosition} inclination={0} azimuth={0.25} />
            <directionalLight
              shadow-camera-left={-40}
              shadow-camera-right={40}
              shadow-camera-top={40}
              shadow-camera-bottom={-40}
              position={sunPosition}
              castShadow
            />
            <ambientLight intensity={0.2} />
            <React.Suspense fallback={null}>
              <Floor />
              <Model />
            </React.Suspense>
            <PerspectiveCamera theatreKey="Camera" makeDefault position={[0, 0, 0]} />
            <Stats />
          </SheetProvider>
        </ScrollControls>
      </Canvas>
      <Loader />
    </>
  )
}
