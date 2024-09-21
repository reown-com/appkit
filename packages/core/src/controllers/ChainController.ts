import { proxyMap, subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { ChainAdapter, Connector, NetworkControllerState } from '../utils/TypeUtil.js'

import { AccountController, type AccountControllerState } from './AccountController.js'
import { PublicStateController } from './PublicStateController.js'
import {
  NetworkUtil,
  SafeLocalStorage,
  SafeLocalStorageKeys,
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace
} from '@reown/appkit-common'
import { StorageUtil } from '../utils/StorageUtil.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'

// -- Types --------------------------------------------- //
export interface ChainControllerState {
  activeChain: ChainNamespace | undefined
  activeCaipAddress: CaipAddress | undefined
  activeCaipNetwork?: CaipNetwork
  chains: Map<ChainNamespace, ChainAdapter>
  activeConnector?: Connector
  universalAdapter: Pick<ChainAdapter, 'networkControllerClient' | 'connectionControllerClient'>
  noAdapters: boolean
}

type ChainControllerStateKey = keyof ChainControllerState

type ChainsInitializerAdapter = Pick<
  ChainAdapter,
  | 'connectionControllerClient'
  | 'networkControllerClient'
  | 'defaultNetwork'
  | 'chainNamespace'
  | 'adapterType'
  | 'caipNetworks'
>

// -- Constants ----------------------------------------- //
const accountState: AccountControllerState = {
  isConnected: false,
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false,
  addressLabels: new Map(),
  allAccounts: []
}

const networkState: NetworkControllerState = {
  supportsAllNetworks: true,
  smartAccountEnabledNetworks: []
}

// -- State --------------------------------------------- //
const state = proxy<ChainControllerState>({
  chains: proxyMap<ChainNamespace, ChainAdapter>(),
  activeCaipAddress: undefined,
  activeChain: undefined,
  activeCaipNetwork: undefined,
  noAdapters: false,
  universalAdapter: {
    networkControllerClient: undefined,
    connectionControllerClient: undefined
  }
})

// -- Controller ---------------------------------------- //
export const ChainController = {
  state,

  subscribeKey<K extends ChainControllerStateKey>(
    key: K,
    callback: (value: ChainControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  subscribeChainProp<K extends keyof ChainAdapter>(
    property: K,
    callback: (value: ChainAdapter[K] | undefined) => void,
    chain?: ChainNamespace
  ) {
    let prev: ChainAdapter[K] | undefined = undefined

    return sub(state.chains, () => {
      const activeChain = chain || state.activeChain

      if (activeChain) {
        const nextValue = state.chains.get(activeChain)?.[property]
        if (prev !== nextValue) {
          prev = nextValue
          callback(nextValue)
        }
      }
    })
  },

  initialize(adapters: ChainsInitializerAdapter[]) {
    const adapterToActivate = adapters?.[0]

    if (adapters?.length === 0) {
      state.noAdapters = true
    }

    if (!state.noAdapters) {
      state.activeChain = adapterToActivate?.chainNamespace
      PublicStateController.set({ activeChain: adapterToActivate?.chainNamespace })

      adapters.forEach((adapter: ChainsInitializerAdapter) => {
        state.chains.set(adapter.chainNamespace, {
          chainNamespace: adapter.chainNamespace,
          connectionControllerClient: adapter.connectionControllerClient,
          networkControllerClient: adapter.networkControllerClient,
          adapterType: adapter.adapterType,
          accountState,
          networkState,
          caipNetworks: adapter.caipNetworks
        })
      })
    }
  },

  initializeUniversalAdapter(
    adapter: ChainsInitializerAdapter,
    adapters: ChainsInitializerAdapter[]
  ) {
    state.universalAdapter = adapter

    if (adapters.length === 0) {
      const storedCaipNetwork = StorageUtil.getStoredActiveCaipNetwork()

      try {
        if (storedCaipNetwork) {
          state.activeChain = storedCaipNetwork.chainNamespace
        } else {
          state.activeChain =
            adapter?.defaultNetwork?.chainNamespace ?? adapter.caipNetworks[0]?.chainNamespace
        }
      } catch (error) {
        console.warn('>>> Error setting active caip network', error)
      }
    }

    const chains = [...new Set(adapter.caipNetworks.map(caipNetwork => caipNetwork.chainNamespace))]
    chains.forEach((chain: ChainNamespace) => {
      state.chains.set(chain, {
        chainNamespace: chain,
        connectionControllerClient: undefined,
        networkControllerClient: undefined,
        adapterType: adapter.adapterType,
        accountState,
        networkState,
        caipNetworks: adapter.caipNetworks
      })
    })
  },

  setChainNetworkData(chain: ChainNamespace | undefined, props: Partial<NetworkControllerState>) {
    if (!chain) {
      throw new Error('Chain is required to update chain network data')
    }

    const chainAdapter = state.chains.get(chain)
    if (chainAdapter) {
      chainAdapter.networkState = ref({
        ...chainAdapter.networkState,
        ...props
      } as NetworkControllerState)

      state.chains.set(chain, ref(chainAdapter))
    }
  },

  setChainAccountData(
    chain: ChainNamespace | undefined,
    accountProps: Partial<AccountControllerState>,
    replaceState = true
  ) {
    if (!chain) {
      throw new Error('Chain is required to update chain account data')
    }

    const chainAdapter = state.chains.get(chain)

    if (chainAdapter) {
      chainAdapter.accountState = ref({
        ...chainAdapter.accountState,
        ...accountProps
      } as AccountControllerState)
      state.chains.set(chain, chainAdapter)
      if (replaceState || state.chains.size === 1 || state.activeChain === chain) {
        if (accountProps.caipAddress) {
          state.activeCaipAddress = accountProps.caipAddress
        }
        AccountController.replaceState(chainAdapter.accountState)
      }
    }
  },

  // eslint-disable-next-line max-params
  setAccountProp(
    prop: keyof AccountControllerState,
    value: AccountControllerState[keyof AccountControllerState],
    chain: ChainNamespace | undefined,
    replaceState = true
  ) {
    this.setChainAccountData(
      chain,
      {
        [prop]: value
      },
      replaceState
    )
  },

  setActiveNamespace(chain: ChainNamespace | undefined, caipNetwork?: CaipNetwork) {
    if (caipNetwork?.chainNamespace) {
      const newAdapter = chain ? state.chains.get(caipNetwork.chainNamespace) : undefined
      const newNamespace = newAdapter?.chainNamespace !== state.activeChain

      if (newAdapter && newNamespace) {
        state.activeChain = newAdapter.chainNamespace
        state.activeCaipNetwork = caipNetwork
        state.activeCaipAddress = newAdapter.accountState?.caipAddress
        SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID, caipNetwork.id)

        AccountController.replaceState(newAdapter.accountState)

        PublicStateController.set({
          activeChain: chain,
          selectedNetworkId: caipNetwork?.id
        })
      }
    } else {
      state.activeChain = chain
      const caipNetworks = chain ? state.chains.get(chain)?.caipNetworks : []
      state.activeCaipNetwork = caipNetworks?.[0]
      PublicStateController.set({
        activeChain: chain,
        selectedNetworkId: state.activeCaipNetwork?.id
      })
    }
  },

  setActiveCaipNetwork(caipNetwork: CaipNetwork) {
    if (!caipNetwork) {
      return
    }

    const chainAdapter = this.state.chains.get(caipNetwork.chainNamespace)
    const isSupported =
      chainAdapter?.networkState?.supportsAllNetworks ||
      chainAdapter?.caipNetworks.find(network => network.id === caipNetwork.id)

    if (!isSupported) {
      this.showUnsupportedChainUI()

      return
    }

    const sameNamespace = caipNetwork.chainNamespace === state.activeChain

    if (sameNamespace) {
      state.activeChain = caipNetwork.chainNamespace
      state.activeCaipNetwork = caipNetwork
      PublicStateController.set({
        activeChain: state.activeChain,
        selectedNetworkId: state.activeCaipNetwork?.id
      })
      SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID, caipNetwork.id)
    } else {
      this.setActiveNamespace(caipNetwork.chainNamespace, caipNetwork)
    }
  },
  setActiveConnector(connector: ChainControllerState['activeConnector']) {
    if (connector) {
      state.activeConnector = ref(connector)
    }
  },

  getNetworkControllerClient() {
    const walletId = SafeLocalStorage.getItem(SafeLocalStorageKeys.WALLET_ID)
    const chain = state.activeChain
    const isWcConnector = walletId === 'walletConnect'
    const universalNetworkControllerClient = state.universalAdapter.networkControllerClient

    const shouldUseUniversalAdapter = isWcConnector || state.noAdapters

    if (shouldUseUniversalAdapter) {
      if (!universalNetworkControllerClient) {
        throw new Error("Universal Adapter's networkControllerClient is not set")
      }

      return universalNetworkControllerClient
    }

    if (!chain) {
      throw new Error('Chain is required to get network controller client')
    }

    const chainAdapter = state.chains.get(chain)

    if (!chainAdapter) {
      throw new Error('Chain adapter not found')
    }

    if (!chainAdapter.networkControllerClient) {
      throw new Error('Network client not set for this adapter')
    }

    return chainAdapter.networkControllerClient
  },

  getConnectionControllerClient(_chain?: ChainNamespace) {
    const chain = _chain || state.activeChain
    const isWcConnector =
      SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR) === 'WALLET_CONNECT'
    const universalConnectionControllerClient = state.universalAdapter.connectionControllerClient
    const hasWagmiAdapter = state.chains.get('eip155')?.adapterType === 'wagmi'

    const shouldUseUniversalAdapter = (isWcConnector && !hasWagmiAdapter) || state.noAdapters

    if (shouldUseUniversalAdapter) {
      if (!universalConnectionControllerClient) {
        throw new Error("Universal Adapter's ConnectionControllerClient is not set")
      }

      return universalConnectionControllerClient
    }

    if (!chain) {
      throw new Error('Chain is required to get connection controller client')
    }

    const chainAdapter = state.chains.get(chain)

    if (!chainAdapter) {
      throw new Error('Chain adapter not found')
    }

    if (!chainAdapter.connectionControllerClient) {
      throw new Error('ConnectionController client not set')
    }

    return chainAdapter.connectionControllerClient
  },

  getAccountProp<K extends keyof AccountControllerState>(
    key: K,
    _chain?: ChainNamespace
  ): AccountControllerState[K] | undefined {
    let chain = state.activeChain

    if (_chain) {
      chain = _chain
    }

    if (!chain) {
      return undefined
    }

    const chainAccountState = state.chains.get(chain)?.accountState

    if (!chainAccountState) {
      return undefined
    }

    return chainAccountState[key]
  },

  getNetworkProp<K extends keyof NetworkControllerState>(
    key: K,
    _chain?: ChainNamespace
  ): NetworkControllerState[K] | undefined {
    const chain = _chain || state.activeChain

    if (!chain) {
      return undefined
    }

    const chainNetworkState = state.chains.get(chain)?.networkState

    if (!chainNetworkState) {
      return undefined
    }

    return chainNetworkState[key]
  },

  getApprovedCaipNetworkIds(chainToFilter?: ChainNamespace) {
    if (chainToFilter) {
      const chain = chainToFilter

      if (!chain) {
        throw new Error('chain is required to get approved network IDs')
      }

      return this.state.chains.get(chain)?.networkState?.approvedCaipNetworkIds
    }

    const allCaipNetworkIds: CaipNetworkId[] = []

    Object.values(this.state.chains).forEach(adapter => {
      if (adapter.networkState.approvedCaipNetworkIds) {
        allCaipNetworkIds.push(...adapter.networkState.approvedCaipNetworkIds)
      }
    })

    return allCaipNetworkIds
  },

  async setApprovedCaipNetworksData(chain: ChainNamespace | undefined) {
    const networkControllerClient = this.getNetworkControllerClient()

    const data = await networkControllerClient?.getApprovedCaipNetworksData()
    console.log('NetworkControllerClient response:', data, networkControllerClient)
    if (!chain) {
      throw new Error('chain is required to set approved network data')
    }

    this.setChainNetworkData(chain, data)
  },

  getRequestedCaipNetworks(namespace?: ChainNamespace) {
    const approvedIds: `${string}:${string}`[] = []
    const requestedNetworks: CaipNetwork[] = []
    const chainAdapters: ChainNamespace[] = namespace ? [namespace] : [...this.state.chains.keys()]

    chainAdapters.forEach((_namespace: ChainNamespace) => {
      const { approvedCaipNetworkIds, requestedCaipNetworks } =
        this.state.chains.get(_namespace)?.networkState || {}
      if (approvedCaipNetworkIds) {
        approvedIds.push(...approvedCaipNetworkIds)
      }
      if (requestedCaipNetworks) {
        requestedNetworks.push(...requestedCaipNetworks)
      }
    })

    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(approvedIds, requestedNetworks)

    return sortedNetworks
  },

  setRequestedCaipNetworks(requestedNetworks: CaipNetwork[], namespace?: ChainNamespace) {
    this.setChainNetworkData(namespace, { requestedCaipNetworks: requestedNetworks })
  },

  async switchActiveNetwork(network: CaipNetwork) {
    const networkControllerClient = this.getNetworkControllerClient()

    await networkControllerClient?.switchCaipNetwork(network)
    this.setActiveCaipNetwork(network)

    if (network) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SWITCH_NETWORK',
        properties: { network: network.id }
      })
    }
  },

  // Smart Accounts
  setSmartAccountEnabledNetworks(
    smartAccountEnabledNetworks: NetworkControllerState['smartAccountEnabledNetworks'],
    chain: ChainNamespace | undefined
  ) {
    this.setChainNetworkData(chain, { smartAccountEnabledNetworks })
  },

  checkIfSmartAccountEnabled() {
    const networkId = NetworkUtil.caipNetworkIdToNumber(this.state.activeCaipNetwork?.id)
    const { activeChain } = this.state

    if (!activeChain) {
      throw new Error('activeChain is required to check if smart account is enabled')
    }

    if (!networkId) {
      return false
    }

    const smartAccountEnabledNetworks = this.getNetworkProp('smartAccountEnabledNetworks')

    return Boolean(smartAccountEnabledNetworks?.includes(Number(networkId)))
  },

  _getClient() {
    return ChainController.getNetworkControllerClient()
  },

  // Resetters
  resetAccount(chain: ChainNamespace | undefined) {
    const chainToWrite = chain

    if (!chainToWrite) {
      throw new Error('Chain is required to set account prop')
    }

    this.state.activeCaipAddress = undefined
    this.setChainAccountData(
      chainToWrite,
      ref({
        isConnected: false,
        smartAccountDeployed: false,
        currentTab: 0,
        caipAddress: undefined,
        address: undefined,
        balance: undefined,
        balanceSymbol: undefined,
        profileName: undefined,
        profileImage: undefined,
        addressExplorerUrl: undefined,
        tokenBalance: [],
        connectedWalletInfo: undefined,
        preferredAccountType: undefined,
        socialProvider: undefined,
        socialWindow: undefined,
        farcasterUrl: undefined,
        provider: undefined
      })
    )
  },
  resetNetwork() {
    const chain = this.state.activeChain

    if (!chain) {
      throw new Error('chain is required to reset network')
    }

    this.setChainNetworkData(chain, {
      approvedCaipNetworkIds: undefined,
      supportsAllNetworks: true,
      smartAccountEnabledNetworks: []
    })
  },

  // Utitilies
  isCurrentNetworkSupported(): boolean {
    const activeCaipNetwork = state.activeCaipNetwork
    const requestedCaipNetworks = this.getRequestedCaipNetworks() || []

    if (!requestedCaipNetworks.length) {
      return true
    }

    if (!activeCaipNetwork) {
      return true
    }

    return requestedCaipNetworks?.some(network => network.id === activeCaipNetwork?.id)
  },

  showUnsupportedChainUI() {
    setTimeout(() => {
      ModalController.open({ view: 'UnsupportedChain' })
    }, 300)
  },
  getActiveNetworkTokenAddress() {
    const address =
      ConstantsUtil.NATIVE_TOKEN_ADDRESS[this.state.activeCaipNetwork?.chainNamespace || 'eip155']

    return `${this.state.activeCaipNetwork?.id || 'eip155:1'}:${address}`
  }
}
