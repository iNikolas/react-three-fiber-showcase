import { Loader, ScrollControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { getProject } from '@theatre/core'
import { PerspectiveCamera, SheetProvider } from '@theatre/r3f'
import React from 'react'

import { Env, Floor, Light } from '../components'
import animatedCameraState from '../constants/animated-camera-state.json'
import { Models } from './models'

export function BasicScene() {
  const sheet = getProject('Fly Through', { state: animatedCameraState }).sheet('Scene')

  return (
    <>
      <Canvas shadows>
        <ScrollControls pages={4}>
          <SheetProvider sheet={sheet}>
            <Env />
            <Light />
            <React.Suspense fallback={null}>
              <Floor />
              <Models />
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
