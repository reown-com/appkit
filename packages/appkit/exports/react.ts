import { CoreHelperUtil, type UseAppKitNetworkReturn } from '@reown/appkit-controllers'
import { useAppKitNetworkCore } from '@reown/appkit-controllers/react'
import type { AppKitNetwork } from '@reown/appkit/networks'

import { AppKit } from '../src/client/appkit.js'
import { getAppKit } from '../src/library/react/index.js'
import { _internalFetchBalance } from '../src/utils/BalanceUtil.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'
import { PACKAGE_VERSION } from './constants.js'

// -- Hooks ------------------------------------------------------------
export * from '../src/library/react/index.js'

// -- Utils & Other -----------------------------------------------------
export * from '../src/utils/index.js'
export type * from '@reown/appkit-controllers'
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@reown/appkit-common'
export type { AppKitBaseClient, OpenOptions, Views } from '../src/client/appkit-base-client.js'
export { CoreHelperUtil } from '@reown/appkit-controllers'

export let modal: AppKit | undefined = undefined

export type CreateAppKit = Omit<AppKitOptions, 'sdkType' | 'sdkVersion' | 'basic'>

export function createAppKit(options: CreateAppKit) {
  if (!modal) {
    modal = new AppKit({
      ...options,
      sdkVersion: CoreHelperUtil.generateSdkVersion(
        options.adapters ?? [],
        'react',
        PACKAGE_VERSION
      )
    })
    getAppKit(modal)
  }

  return modal
}

export { AppKit }
export type { AppKitOptions }

// -- Hooks ------------------------------------------------------------
export * from '../src/library/react/index.js'

export { useAppKitProvider } from '@reown/appkit-controllers/react'

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

export function useAppKitBalance() {
  async function fetchBalance() {
    return await _internalFetchBalance(modal)
  }

  return {
    fetchBalance
  }
}

export { useAppKitAccount } from '@reown/appkit-controllers/react'

export {
  AppKitButton,
  AppKitNetworkButton,
  AppKitConnectButton,
  AppKitAccountButton
} from '../src/library/react/components.js'

export { AppKitProvider } from '../src/library/react/providers.js'
export type { AppKitProviderProps } from '../src/library/react/providers.js'
