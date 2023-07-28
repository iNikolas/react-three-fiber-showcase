import React from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { humanSkinColor } from '../constants'

export function Human({ setGroup }: { setGroup: React.Dispatch<React.SetStateAction<THREE.Group | null>> }) {
  const { scene: human } = useLoader(GLTFLoader, './models/human.glb')

  React.useEffect(() => {
    if (human) {
      setGroup(human)
    }
  }, [human, setGroup])

  return (
    <primitive
      children-0-castShadow
      children-0-material-color={humanSkinColor}
      children-0-rotation-z={Math.PI / 5}
      object={human}
    />
  )
}
