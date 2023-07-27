import { Sky } from '@react-three/drei'

import { skyDistance, sunPosition } from '../constants'

export function Env() {
  return <Sky distance={skyDistance} sunPosition={sunPosition} inclination={0} azimuth={0.25} />
}
