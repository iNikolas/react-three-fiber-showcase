import { Center } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'

import { crosshairColor, crosshairPadding, crosshairPeripheryLineLength, crosshairWidth } from '../../constants'
import { assertIsMesh } from '../../utils'

export function Crosshair({ target }: { target: THREE.Group }) {
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
    if (crossHairRef.current) {
      crossHairRef.current.lookAt(camera.position)
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
