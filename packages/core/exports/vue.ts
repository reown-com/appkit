import { ref, onUnmounted } from 'vue'
import { AccountController } from '../src/controllers/AccountController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import { ChainController } from '../src/controllers/ChainController.js'
import { ConnectionController } from '../src/controllers/ConnectionController.js'

// -- Hooks ------------------------------------------------------------
export function useAppKitAccount() {
  const state = ref({
    address: CoreHelperUtil.getPlainAddress(ChainController.state.activeCaipAddress) ?? null,
    caipAddress: ChainController.state.activeCaipAddress ?? null,
    status: AccountController.state.status ?? null,
    isConnected: Boolean(ChainController.state.activeCaipAddress)
  })

  const unsubscribeCaipAddress = ChainController.subscribeKey('activeCaipAddress', val => {
    state.value.caipAddress = val ?? null
    state.value.address = CoreHelperUtil.getPlainAddress(val) ?? null
    state.value.isConnected = Boolean(val)
  })

  const unsubscribeStatus = AccountController.subscribeKey('status', val => {
    state.value.status = val ?? null
  })

  onUnmounted(() => {
    unsubscribeCaipAddress?.()
    unsubscribeStatus?.()
  })

  return state
}

export function useDisconnect() {
  async function disconnect() {
    await ConnectionController.disconnect()
  }

  return { disconnect }
}
