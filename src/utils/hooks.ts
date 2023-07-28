import React from 'react'
import * as THREE from 'three'
import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { val } from '@theatre/core'
import { useCurrentSheet } from '@theatre/r3f'

export function useTheatreSheetBindingToScroll() {
  const sheet = useCurrentSheet()
  const scroll = useScroll()

  useFrame(() => {
    if (sheet?.sequence) {
      const sequenceLength = val(sheet.sequence.pointer.length)
      sheet.sequence.position = scroll.offset * sequenceLength
    }
  })
}

export function useMeshToOutline({
  objectsList,
  threshold
}: {
  objectsList: Array<THREE.Group | null>
  threshold: number
}): THREE.Group | null {
  const [meshToOutline, setMeshToOutline] = React.useState<THREE.Group | null>(null)

  useFrame(({ camera }) => {
    const cameraDistances = objectsList.reduce<Array<[THREE.Group, number]>>(
      (acc, group) => (group ? [...acc, [group, camera.position.distanceTo(group.position)]] : acc),
      []
    )

    const newMeshToOutline = cameraDistances.reduce<[null | THREE.Group, number]>(
      ([accMesh, accDistance], [mesh, distance]) =>
        accDistance < distance ? [accMesh, accDistance] : [mesh, distance],
      [null, threshold]
    )[0]

    if (meshToOutline !== newMeshToOutline) {
      setMeshToOutline(newMeshToOutline)
    }
  })

  return meshToOutline
}
