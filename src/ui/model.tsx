import React from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useCurrentSheet } from '@theatre/r3f'
import { useScroll } from '@react-three/drei'
import { val } from '@theatre/core'

import { crosshairThreshold, humanSkinColor } from '../constants'
import { Crosshair } from '../components'

export function Model() {
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
