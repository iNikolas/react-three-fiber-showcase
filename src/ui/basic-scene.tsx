import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader, ScrollControls } from '@react-three/drei'
import { PerspectiveCamera, SheetProvider } from '@theatre/r3f'
import { getProject } from '@theatre/core'

import { Env, Floor, Light } from '../components'
import animatedCameraState from '../constants/animated-camera-state.json'
import { Model } from './model'

export function BasicScene() {
  const sheet = getProject('Fly Through', { state: animatedCameraState }).sheet('Scene')

  return (
    <>
      <Canvas gl={{ preserveDrawingBuffer: true }} shadows>
        <ScrollControls pages={4}>
          <SheetProvider sheet={sheet}>
            <Env />
            <Light />
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
          </SheetProvider>
        </ScrollControls>
      </Canvas>
      <Loader />
    </>
  )
}
