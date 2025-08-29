import { type Ref, onUnmounted, ref } from 'vue'

import { ChainController, type UseAppKitNetworkReturn } from '@reown/appkit-controllers'
import type { AppKitNetwork } from '@reown/appkit/networks'

import { AppKit } from '../src/client/appkit-core.js'
import { getAppKit } from '../src/library/vue/index.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'
import { PACKAGE_VERSION } from './constants.js'

// -- Hooks ------------------------------------------------------------
export * from '../src/library/vue/index.js'

// -- Utils & Other -----------------------------------------------------
export * from '../src/utils/index.js'
export type * from '@reown/appkit-controllers'
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@reown/appkit-common'
export { CoreHelperUtil } from '@reown/appkit-controllers'

let modal: AppKit | undefined = undefined

export type CreateAppKit = Omit<AppKitOptions, 'sdkType' | 'sdkVersion' | 'basic'>

export function createAppKit(options: CreateAppKit) {
  if (!modal) {
    modal = new AppKit({
      ...options,
      basic: true,
      sdkVersion: `vue-core-${PACKAGE_VERSION}`
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
    caipNetwork: ChainController.getActiveCaipNetwork(),
    chainId: ChainController.getActiveCaipNetwork()?.id,
    caipNetworkId: ChainController.getActiveCaipNetwork()?.caipNetworkId,
    switchNetwork: (network: AppKitNetwork) => {
      modal?.switchNetwork(network)
    }
  })

  const unsubscribe = ChainController.subscribe(snapshot => {
    const activeChain = snapshot.context.activeChain

    if (!activeChain) {
      return
    }

    const namespaceState = snapshot.context.namespaces.get(activeChain)

    if (!namespaceState) {
      return
    }

    state.value.caipNetwork = namespaceState.activeCaipNetwork
    state.value.chainId = namespaceState.activeCaipNetwork?.id
    state.value.caipNetworkId = namespaceState.activeCaipNetwork?.caipNetworkId
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return state
}

export * from '../src/library/vue/index.js'
