import { AppKit } from '../src/client.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'
import { getAppKit } from '../src/library/vue/index.js'
import { ChainController, CoreHelperUtil, type UseAppKitNetworkReturn } from '@reown/appkit-core'
import { PACKAGE_VERSION } from './constants.js'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { onUnmounted, ref, type Ref } from 'vue'

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
export function useAppKitNetwork(): Ref<UseAppKitNetworkReturn> {
  const state = ref({
    caipNetwork: ChainController.state.activeCaipNetwork,
    chainId: ChainController.state.activeCaipNetwork?.id,
    caipNetworkId: ChainController.state.activeCaipNetwork?.caipNetworkId,
    switchNetwork: (network: AppKitNetwork) => {
      modal?.switchNetwork(network)
    }
  })

  const unsubscribe = ChainController.subscribeKey('activeCaipNetwork', val => {
    state.value.caipNetwork = val
    state.value.chainId = val?.id
    state.value.caipNetworkId = val?.caipNetworkId
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return state
}

export * from '../src/library/vue/index.js'
