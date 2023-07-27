import React from 'react'
import * as THREE from 'three'
import { Stats, useScroll, Loader, useTexture, ScrollControls, Sky, Center } from '@react-three/drei'
import { Canvas, useLoader, useFrame, extend, ReactThreeFiber } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { getProject, val } from '@theatre/core'
import { SheetProvider, PerspectiveCamera, useCurrentSheet } from '@theatre/r3f'

import animatedCameraState from './animated-camera-state.json'

extend({ Line_: THREE.Line })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      line_: ReactThreeFiber.Object3DNode<THREE.Line, typeof THREE.Line>
    }
  }
}

const humanSkinColor = '#FC9'
const floorSize = 1000
const sunPosition: [number, number, number] = [10, 60, 200]
const crosshairThreshold = 40
const crosshairColor = 'orange'
const crosshairWidth = 0.1
const crosshairPadding = 0.3
const crosshairPeripheryLineLength = 10000

function assertIsMesh(object: unknown): asserts object is THREE.Mesh {
  if ((object as any).type !== 'Mesh') {
    throw new Error('Provided object is not of Mesh type')
  }
}

function Crosshair({ target }: { target: THREE.Group }) {
  const crossHairRef = React.useRef<THREE.Mesh | null>(null)

  const targetMesh = target.children[0]
  assertIsMesh(targetMesh)

  const targetMeshHeight = React.useMemo(() => {
    if (!targetMesh.geometry.boundingBox) {
      targetMesh.geometry.computeBoundingBox()
    }

    if (!targetMesh.geometry.boundingBox) {
      throw new Error('Bounding Box for a Mesh was not computed')
    }

    return (targetMesh.geometry.boundingBox.max.z - targetMesh.geometry.boundingBox.min.z) * targetMesh.scale.z
  }, [targetMesh])

  const crosshairSize = React.useMemo(() => {
    if (!targetMesh.geometry.boundingSphere) {
      targetMesh.geometry.computeBoundingSphere()
    }

    if (!targetMesh.geometry.boundingSphere) {
      throw new Error('Bounding Sphere for a Mesh was not computed')
    }

    return Math.max(targetMesh.geometry.boundingSphere.radius * targetMesh.scale.z, targetMeshHeight) + crosshairPadding
  }, [targetMesh, targetMeshHeight])

  useFrame(({ camera }) => {
    if (crossHairRef && crossHairRef.current) {
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

const verticalPoints = []
verticalPoints.push(new THREE.Vector3(0, 0, 0))
verticalPoints.push(new THREE.Vector3(0, crosshairPeripheryLineLength, 0))

const horizontalPoints = []
horizontalPoints.push(new THREE.Vector3(0, 0, 0))
horizontalPoints.push(new THREE.Vector3(crosshairPeripheryLineLength, 0, 0))

const verticalLineGeometry = new THREE.BufferGeometry().setFromPoints(verticalPoints)
const horizontalLineGeometry = new THREE.BufferGeometry().setFromPoints(horizontalPoints)

function CrosshairPeripheryLines({ crosshairSize, topOffset }: { crosshairSize: number; topOffset: number }) {
  return (
    <>
      <Center position={[0, crosshairSize / 2 - topOffset, 0]} top>
        <line_ geometry={verticalLineGeometry}>
          <lineBasicMaterial attach="material" color={crosshairColor} />
        </line_>
      </Center>
      <Center position={[0, -crosshairSize / 2, 0]} bottom>
        <line_ geometry={verticalLineGeometry}>
          <lineBasicMaterial attach="material" color={crosshairColor} />
        </line_>
      </Center>
      <Center position={[-crosshairSize / 2, 0, 0]} left>
        <line_ geometry={horizontalLineGeometry}>
          <lineBasicMaterial attach="material" color={crosshairColor} />
        </line_>
      </Center>
      <Center position={[crosshairSize / 2, 0, 0]} right>
        <line_ geometry={horizontalLineGeometry}>
          <lineBasicMaterial attach="material" color={crosshairColor} />
        </line_>
      </Center>
    </>
  )
}

function Floor() {
  const texture = useTexture('./img/TilePattern-n1_UR_1024.png')

  React.useLayoutEffect(() => {
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
  const [meshToOutline, setMeshToOutline] = React.useState<THREE.Group | null>(null)

  const { scene: human } = useLoader(GLTFLoader, './models/human.glb')
  const { scene: cat } = useLoader(GLTFLoader, './models/cat.glb')

  const sheet = useCurrentSheet()
  const scroll = useScroll()

  useFrame(({ camera }) => {
    if (sheet?.sequence) {
      const sequenceLength = val(sheet.sequence.pointer.length)
      sheet.sequence.position = scroll.offset * sequenceLength
    }

    const cameraDistances: Array<[THREE.Group, number]> = [
      [human, camera.position.distanceTo(human.position)],
      [cat, camera.position.distanceTo(cat.position)]
    ]

    const newMeshToOutline = cameraDistances.reduce<[null | THREE.Group, number]>(
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
            <PerspectiveCamera
              theatreKey="Camera"
              makeDefault
              position={[0, 0, 0]}
              attachArray={undefined}
              attachObject={undefined}
              attachFns={undefined}
            />
            <Stats />
          </SheetProvider>
        </ScrollControls>
      </Canvas>
      <Loader />
    </>
  )
}
