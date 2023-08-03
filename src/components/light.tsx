import { ambientLightIntensity, shadowCameraResolution, sunPosition } from '../constants'

export function Light() {
  return (
    <>
      <directionalLight
        shadow-camera-left={-shadowCameraResolution}
        shadow-camera-right={shadowCameraResolution}
        shadow-camera-top={shadowCameraResolution}
        shadow-camera-bottom={-shadowCameraResolution}
        shadow-camera-far={sunPosition[2] + shadowCameraResolution * 2}
        position={sunPosition}
        castShadow
      />
      <ambientLight intensity={ambientLightIntensity} />
    </>
  )
}
