import { AccountController } from '../src/controllers/AccountController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import { ChainController } from '../src/controllers/ChainController.js'
import type { CaipNetwork, CaipNetworkId } from '@reown/appkit-common'
import { ref } from 'valtio/vanilla'
import { onUnmounted } from 'vue'
import { ConnectionController } from '../src/controllers/ConnectionController.js'

// -- Hooks ------------------------------------------------------------
export function useAppKitNetwork(): {
  caipNetwork: CaipNetwork | undefined
  chainId: number | string | undefined
  caipNetworkId: CaipNetworkId | undefined
} {
  const state = ref({
    activeCaipNetwork: ChainController.state.activeCaipNetwork
  })

  const unsubscribe = ChainController.subscribeKey('activeCaipNetwork', val => {
    state.activeCaipNetwork = val
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return {
    caipNetwork: state.activeCaipNetwork,
    chainId: state.activeCaipNetwork?.id,
    caipNetworkId: state.activeCaipNetwork?.caipNetworkId
  }
}

export function useAppKitAccount() {
  const state = ref({
    activeCaipAddress: ChainController.state.activeCaipAddress,
    status: AccountController.state.status
  })

  const unsubscribe = ChainController.subscribeKey('activeCaipAddress', val => {
    state.activeCaipAddress = val
  })

  const unsubscribeStatus = AccountController.subscribeKey('status', val => {
    state.status = val
  })

  onUnmounted(() => {
    unsubscribe?.()
    unsubscribeStatus?.()
  })

  return {
    caipAddress: state.activeCaipAddress,
    address: CoreHelperUtil.getPlainAddress(state.activeCaipAddress),
    isConnected: Boolean(state.activeCaipAddress),
    status: state.status
  }
}

export function useDisconnect() {
  async function disconnect() {
    await ConnectionController.disconnect()
  }

  return { disconnect }
}
