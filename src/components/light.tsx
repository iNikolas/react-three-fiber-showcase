import { ambientLightIntensity, shadowCameraResolution, sunPosition } from '../constants'

export function Light() {
  return (
    <>
      <directionalLight
        shadow-camera-left={-shadowCameraResolution}
        shadow-camera-right={shadowCameraResolution}
        shadow-camera-top={shadowCameraResolution}
        shadow-camera-bottom={-shadowCameraResolution}
        position={sunPosition}
        castShadow
      />
      <ambientLight intensity={ambientLightIntensity} />
    </>
  )
}