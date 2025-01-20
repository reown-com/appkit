import { type Ref, onUnmounted, ref } from 'vue'

import { AccountController } from '../src/controllers/AccountController.js'
import { ChainController } from '../src/controllers/ChainController.js'
import { ConnectionController } from '../src/controllers/ConnectionController.js'
import { ConnectorController } from '../src/controllers/ConnectorController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import type { SocialProvider, UseAppKitAccountReturn } from '../src/utils/TypeUtil.js'

// -- Hooks ------------------------------------------------------------
export function useAppKitAccount(): Ref<UseAppKitAccountReturn> {
  const authConnector = ConnectorController.getAuthConnector()
  const state = ref({
    allAccounts: AccountController.state.allAccounts,
    address: CoreHelperUtil.getPlainAddress(ChainController.state.activeCaipAddress),
    caipAddress: ChainController.state.activeCaipAddress,
    status: AccountController.state.status,
    isConnected: Boolean(ChainController.state.activeCaipAddress),
    embeddedWalletInfo: authConnector
      ? {
          user: AccountController.state.user,
          authProvider:
            AccountController.state.socialProvider ?? ('email' as SocialProvider | 'email'),
          accountType: AccountController.state.preferredAccountType,
          isSmartAccountDeployed: Boolean(AccountController.state.smartAccountDeployed)
        }
      : undefined
  })

  const unsubscribeCaipAddress = ChainController.subscribeKey('activeCaipAddress', val => {
    state.value.caipAddress = val
    state.value.address = CoreHelperUtil.getPlainAddress(val)
    state.value.isConnected = Boolean(val)
  })

  const unsubscribeStatus = AccountController.subscribeKey('status', val => {
    state.value.status = val
  })

  const unsubscribeAllAccounts = AccountController.subscribeKey('allAccounts', val => {
    state.value.allAccounts = [...val]
  })

  const unsubscribeAccountDeployed = AccountController.subscribeKey('smartAccountDeployed', val => {
    if (state.value.embeddedWalletInfo) {
      state.value.embeddedWalletInfo.isSmartAccountDeployed = Boolean(val)
    }
  })

  const unsubscribeAccountType = AccountController.subscribeKey('preferredAccountType', val => {
    if (state.value.embeddedWalletInfo) {
      state.value.embeddedWalletInfo.accountType = val
    }
  })

  const unsubscribeUser = AccountController.subscribeKey('user', val => {
    if (state.value.embeddedWalletInfo) {
      state.value.embeddedWalletInfo.user = val
    }
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
