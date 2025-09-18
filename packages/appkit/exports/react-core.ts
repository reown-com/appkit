import { type UseAppKitNetworkReturn } from '@reown/appkit-controllers'
import { useAppKitNetworkCore } from '@reown/appkit-controllers/react'
import type { AppKitNetwork } from '@reown/appkit/networks'

import { AppKit } from '../src/client/appkit-core.js'
import { getAppKit } from '../src/library/react/index.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'
import { PACKAGE_VERSION } from './constants.js'

// -- Hooks ------------------------------------------------------------
export * from '../src/library/react/index.js'

// -- Utils & Other -----------------------------------------------------
export * from '../src/utils/index.js'
export type * from '@reown/appkit-controllers'
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@reown/appkit-common'
export { CoreHelperUtil } from '@reown/appkit-controllers'

export let modal: AppKit | undefined = undefined

export type CreateAppKit = Omit<AppKitOptions, 'sdkType' | 'sdkVersion' | 'basic'>

export function createAppKit(options: CreateAppKit) {
  if (!modal) {
    modal = new AppKit({
      ...options,
      sdkVersion: `react-core-${PACKAGE_VERSION}`,
      basic: true
    })
    getAppKit(modal)
  }

  return modal
}

export { AppKit }
export type { AppKitOptions }

// -- Hooks ------------------------------------------------------------
export * from '../src/library/react/index.js'

export function useAppKitNetwork(): UseAppKitNetworkReturn {
  const { caipNetwork, caipNetworkId, chainId } = useAppKitNetworkCore()

  async function switchNetwork(network: AppKitNetwork) {
    await modal?.switchNetwork(network)
  }

  return {
    caipNetwork,
    caipNetworkId,
    chainId,
    switchNetwork
  }
}

export { useAppKitAccount } from '@reown/appkit-controllers/react'
