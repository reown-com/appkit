import { ref, onUnmounted } from 'vue'
import { AccountController } from '../src/controllers/AccountController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import { ChainController } from '../src/controllers/ChainController.js'
import { ConnectionController } from '../src/controllers/ConnectionController.js'

// -- Hooks ------------------------------------------------------------
export function useAppKitAccount() {
  const state = ref({
    allAccounts: AccountController.state.allAccounts,
    address: CoreHelperUtil.getPlainAddress(ChainController.state.activeCaipAddress) ?? null,
    caipAddress: ChainController.state.activeCaipAddress ?? null,
    status: AccountController.state.status ?? null,
    isConnected: Boolean(ChainController.state.activeCaipAddress),
    embeddedWalletInfo: {
      user: AccountController.state.user ?? null,
      accountType: AccountController.state.preferredAccountType ?? null,
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

  const unsubscribeAllAccounts = AccountController.subscribeKey('allAccounts', val => {
    state.value.allAccounts = [...val]
  })

  const unsubscribeAccountDeployed = AccountController.subscribeKey('smartAccountDeployed', val => {
    state.value.embeddedWalletInfo.isSmartAccountDeployed = Boolean(val)
  })

  const unsubscribeAccountType = AccountController.subscribeKey('preferredAccountType', val => {
    state.value.embeddedWalletInfo.accountType = val ?? null
  })

  const unsubscribeUser = AccountController.subscribeKey('user', val => {
    state.value.embeddedWalletInfo.user = val ?? null
  })

  onUnmounted(() => {
    unsubscribeCaipAddress?.()
    unsubscribeStatus?.()
    unsubscribeAccountDeployed?.()
    unsubscribeAccountType?.()
    unsubscribeUser?.()
    unsubscribeAllAccounts?.()
  })

  return state
}

export function useDisconnect() {
  async function disconnect() {
    await ConnectionController.disconnect()
  }

  return { disconnect }
}
