import { AppKit } from '../src/client.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'
import { getAppKit } from '../src/library/vue/index.js'
import { CoreHelperUtil } from '@reown/appkit-core'
import { PACKAGE_VERSION } from './constants.js'
import { useAppKitNetworkCore } from '@reown/appkit-core/vue'
import type { CaipNetwork } from '@reown/appkit'
import type { AppKitNetwork } from '@reown/appkit/networks'

// -- Views ------------------------------------------------------------
export * from '@reown/appkit-scaffold-ui'

// -- Hooks ------------------------------------------------------------
export * from '../src/library/vue/index.js'

// -- Utils & Other -----------------------------------------------------
export * from '../src/utils/index.js'
export type * from '@reown/appkit-core'
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@reown/appkit-common'
export { CoreHelperUtil, AccountController } from '@reown/appkit-core'

let modal: AppKit | undefined = undefined

type CreateAppKit = Omit<AppKitOptions, 'sdkType' | 'sdkVersion'>

export function createAppKit(options: CreateAppKit) {
  if (!modal) {
    modal = new AppKit({
      ...options,
      sdkVersion: CoreHelperUtil.generateSdkVersion(options.adapters ?? [], 'html', PACKAGE_VERSION)
    })
    getAppKit(modal)
  }

  return modal
}

export { AppKit }
export type { AppKitOptions }

// -- Hooks ------------------------------------------------------------
export function useAppKitNetwork() {
  const { caipNetwork, caipNetworkId, chainId } = useAppKitNetworkCore()

  function switchNetwork(network: AppKitNetwork) {
    modal?.switchNetwork(network)
  }

  function addNetwork(network: CaipNetwork) {
    modal?.addNetwork(network)
  }

  return {
    caipNetwork,
    caipNetworkId,
    chainId,
    switchNetwork,
    addNetwork
  }
}

export * from '../src/library/vue/index.js'
