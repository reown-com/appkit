import { useMemo } from 'react'

import { OptionsController, type SIWXConfig } from '@reown/appkit-controllers'

export function useAppKitSIWX<Config extends SIWXConfig = SIWXConfig>() {
  return useMemo(() => OptionsController.state.siwx as Config, [OptionsController.state.siwx])
}
