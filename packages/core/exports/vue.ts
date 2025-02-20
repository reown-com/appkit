import { type Ref, onMounted, onUnmounted, ref } from 'vue'

import type { ChainNamespace } from '@reown/appkit-common'

import { accountState } from '../src/controllers/AccountController.js'
import { ChainController } from '../src/controllers/ChainController.js'
import { ConnectionController } from '../src/controllers/ConnectionController.js'
import { ConnectorController } from '../src/controllers/ConnectorController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import type {
  AccountType,
  ChainAdapter,
  SocialProvider,
  UseAppKitAccountReturn
} from '../src/utils/TypeUtil.js'

// -- Hooks ------------------------------------------------------------
export function useAppKitAccount(options?: {
  namespace?: ChainNamespace
}): Ref<UseAppKitAccountReturn> {
  const chainNamespace = ref(options?.namespace || ChainController.state.activeChain)
  const chains = ref(ChainController.state.chains)
  const state = ref({
    allAccounts: [] as AccountType[],
    address: undefined,
    caipAddress: undefined,
    status: undefined,
    isConnected: false,
    embeddedWalletInfo: undefined
  } as UseAppKitAccountReturn)

  function updateState(
    _chains: Map<ChainNamespace, ChainAdapter>,
    _chainNamespace: ChainNamespace | undefined
  ) {
    const authConnector = _chainNamespace
      ? ConnectorController.getAuthConnector(_chainNamespace)
      : undefined
    const currentState = _chainNamespace ? _chains.get(_chainNamespace)?.accountState : accountState

    state.value.allAccounts = currentState?.allAccounts || []
    state.value.address = CoreHelperUtil.getPlainAddress(currentState?.caipAddress)
    state.value.caipAddress = currentState?.caipAddress
    state.value.status = currentState?.status
    state.value.isConnected = Boolean(currentState?.caipAddress)
    state.value.embeddedWalletInfo = authConnector
      ? {
          user: currentState?.user,
          authProvider: currentState?.socialProvider ?? ('email' as SocialProvider | 'email'),
          accountType: currentState?.preferredAccountType,
          isSmartAccountDeployed: Boolean(currentState?.smartAccountDeployed)
        }
      : undefined
  }

  const unsubscribeActiveChain = ChainController.subscribeKey('activeChain', val => {
    chainNamespace.value = options?.namespace || val
    updateState(chains.value, chainNamespace.value)
  })

  const unsubscribeChains = ChainController.subscribe(val => {
    chains.value = val['chains']
    updateState(chains.value, chainNamespace.value)
  })

  onMounted(() => {
    updateState(chains.value, chainNamespace.value)
  })

  onUnmounted(() => {
    unsubscribeChains()
    unsubscribeActiveChain()
  })

  return state
}

export function useDisconnect() {
  async function disconnect() {
    await ConnectionController.disconnect()
  }

  return { disconnect }
}
