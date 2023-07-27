import React from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

import { floorSize, floorTextureSrc } from '../constants'

export function Floor() {
  const texture = useTexture(floorTextureSrc)

  React.useLayoutEffect(() => {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(floorSize / 10, floorSize / 10)
  }, [texture])

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <circleGeometry args={[floorSize, floorSize, floorSize]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}
