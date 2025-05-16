import { useEffect, useState } from 'react'

import { OptionsController, type SIWXConfig } from '@reown/appkit-controllers'

export function useAppKitSIWX<Config extends SIWXConfig = SIWXConfig>() {
  const [siwx, setSiwx] = useState(OptionsController.state.siwx as Config | undefined)

  useEffect(
    () =>
      OptionsController.subscribeKey('siwx', val => {
        setSiwx(val as Config | undefined)
      }),
    []
  )

  return siwx
}
