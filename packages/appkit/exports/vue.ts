import { type Ref, onUnmounted, ref } from 'vue'

import {
  ChainController,
  CoreHelperUtil,
  type UseAppKitNetworkReturn
} from '@reown/appkit-controllers'
import type { AppKitNetwork } from '@reown/appkit/networks'

import { AppKit } from '../src/client/appkit.js'
import { getAppKit } from '../src/library/vue/index.js'
import { _internalFetchBalance } from '../src/utils/BalanceUtil.js'
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
    switchNetwork: async (network: AppKitNetwork) => {
      await modal?.switchNetwork(network)
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

export function useAppKitBalance() {
  async function fetchBalance() {
    return await _internalFetchBalance(modal)
  }

  return {
    fetchBalance
  }
}

export * from '../src/library/vue/index.js'
