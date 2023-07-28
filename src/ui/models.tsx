import React from 'react'

import { Crosshair } from '../components'
import { crosshairThreshold } from '../constants'
import { useMeshToOutline, useTheatreSheetBindingToScroll } from '../utils'
import { Cat } from './cat'
import { Human } from './human'

export function Models() {
  const [human, setHuman] = React.useState<THREE.Group | null>(null)
  const [cat, setCat] = React.useState<THREE.Group | null>(null)

  const meshToOutline = useMeshToOutline({ threshold: crosshairThreshold, objectsList: [human, cat] })

  useTheatreSheetBindingToScroll()

  return (
    <>
      <Human setGroup={setHuman} />
      <Cat position={[30, 0, 15]} setGroup={setCat} />
      {meshToOutline && <Crosshair target={meshToOutline} />}
    </>
  )
}
