import React from 'react'
import { PrimitiveProps, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const catModelScale = 0.2

export function Cat({
  setGroup,
  ...props
}: { setGroup: React.Dispatch<React.SetStateAction<THREE.Group | null>> } & Partial<PrimitiveProps>) {
  const { scene: cat } = useLoader(GLTFLoader, './models/cat.glb')

  React.useEffect(() => {
    if (cat) {
      setGroup(cat)
    }
  }, [cat, setGroup])

  return (
    <primitive
      children-0-castShadow
      children-0-rotation-x={0}
      children-0-rotation-y={Math.PI / 4}
      children-0-scale={[catModelScale, catModelScale, catModelScale]}
      object={cat}
      {...props}
    />
  )
}
