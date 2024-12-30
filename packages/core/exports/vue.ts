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
    isConnected: Boolean(ChainController.state.activeCaipAddress),
    user: {
      accountType: AccountController.state.preferredAccountType ?? null,
      email: AccountController.state.email ?? null,
      username: AccountController.state.username ?? null,
      isSmartAccountDeployed: Boolean(AccountController.state.smartAccountDeployed)
    }
  })

  const unsubscribeCaipAddress = ChainController.subscribeKey('activeCaipAddress', val => {
    state.value.caipAddress = val ?? null
    state.value.address = CoreHelperUtil.getPlainAddress(val) ?? null
    state.value.isConnected = Boolean(val)
  })

  const unsubscribeStatus = AccountController.subscribeKey('status', val => {
    state.value.status = val ?? null
  })

  const unsubscribeAccountDeployed = AccountController.subscribeKey('smartAccountDeployed', val => {
    state.value.user.isSmartAccountDeployed = Boolean(val)
  })

  const unsubscribeAccountType = AccountController.subscribeKey('preferredAccountType', val => {
    state.value.user.accountType = val ?? null
  })

  const unsubscribeEmail = AccountController.subscribeKey('email', val => {
    state.value.user.email = val ?? null
  })

  const unsubscribeUsername = AccountController.subscribeKey('username', val => {
    state.value.user.username = val ?? null
  })

  onUnmounted(() => {
    unsubscribeCaipAddress?.()
    unsubscribeStatus?.()
    unsubscribeAccountDeployed?.()
    unsubscribeAccountType?.()
    unsubscribeEmail?.()
    unsubscribeUsername?.()
  })

  return state
}

export function useDisconnect() {
  async function disconnect() {
    await ConnectionController.disconnect()
  }

  return { disconnect }
}
