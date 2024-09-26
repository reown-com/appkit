import { proxy, ref } from 'valtio/vanilla'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import {
  NetworkUtil,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace
} from '@reown/appkit-common'
import { ChainController } from './ChainController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'

// -- Types --------------------------------------------- //
export interface NetworkControllerClient {
  switchCaipNetwork: (network: NetworkControllerState['caipNetwork']) => Promise<void>
  getApprovedCaipNetworksData: () => Promise<{
    approvedCaipNetworkIds: CaipNetworkId[]
    supportsAllNetworks: boolean
  }>
}

export interface NetworkControllerState {
  supportsAllNetworks: boolean
  isUnsupportedChain?: boolean
  _client?: NetworkControllerClient
  caipNetwork?: CaipNetwork
  allowUnsupportedCaipNetwork?: boolean
  smartAccountEnabledNetworks?: number[]
}

// -- State --------------------------------------------- //
const state = proxy<NetworkControllerState>({
  supportsAllNetworks: true,
  smartAccountEnabledNetworks: []
})

// -- Controller ---------------------------------------- //
export const NetworkController = {
  state,

  replaceState(newState: NetworkControllerState | undefined) {
    if (!newState) {
      return
    }

    Object.assign(state, ref(newState))
  },

  subscribeKey<K extends keyof NetworkControllerState>(
    property: K,
    callback: (val: NetworkControllerState[K]) => void
  ) {
    let prev: NetworkControllerState[K] | undefined = undefined

    return ChainController.subscribeChainProp('networkState', networkState => {
      if (networkState) {
        const nextValue = networkState[property]
        if (prev !== nextValue) {
          prev = nextValue
          callback(nextValue)
        }
      }
    })
  },

  _getClient() {
    return ChainController.getNetworkControllerClient()
  },

  setActiveCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    if (!caipNetwork) {
      return
    }

    ChainController.setActiveCaipNetwork(caipNetwork)

    const isSupported = this.checkIfSupportedNetwork()

    if (!isSupported) {
      this.showUnsupportedChainUI()
    }
  },

  setCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    if (!caipNetwork) {
      return
    }

    if (!caipNetwork?.chainNamespace) {
      throw new Error('chain is required to set active network')
    }

    ChainController.setCaipNetwork(caipNetwork?.chainNamespace, caipNetwork)
  },

  setRequestedCaipNetworks(requestedNetworks: CaipNetwork[], chain: ChainNamespace | undefined) {
    ChainController.setAdapterNetworkState(chain, { requestedCaipNetworks: requestedNetworks })
  },

  setAllowUnsupportedChain(
    allowUnsupportedCaipNetwork: NetworkControllerState['allowUnsupportedCaipNetwork'],
    chain: ChainNamespace | undefined
  ) {
    ChainController.setAdapterNetworkState(chain || ChainController.state.activeChain, {
      allowUnsupportedCaipNetwork
    })
  },

  setSmartAccountEnabledNetworks(
    smartAccountEnabledNetworks: NetworkControllerState['smartAccountEnabledNetworks'],
    chain: ChainNamespace | undefined
  ) {
    ChainController.setAdapterNetworkState(chain, { smartAccountEnabledNetworks })
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork']) {
    const networkControllerClient = ChainController.getNetworkControllerClient(
      network?.chainNamespace
    )

    if (networkControllerClient) {
      await networkControllerClient.switchCaipNetwork(network)
    }

    ChainController.setActiveCaipNetwork(network)

    if (network) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SWITCH_NETWORK',
        properties: { network: network.id }
      })
    }
  },

  checkIfSupportedNetwork() {
    const chain = ChainController.state.activeChain

    if (!chain) {
      return false
    }

    const activeCaipNetwork = ChainController.state.activeCaipNetwork
    const requestedCaipNetworks = ChainController.getRequestedCaipNetworks(chain)

    if (!requestedCaipNetworks.length) {
      return true
    }

    return requestedCaipNetworks?.some(network => network.id === activeCaipNetwork?.id)
  },

  checkIfSmartAccountEnabled() {
    const networkId = NetworkUtil.caipNetworkIdToNumber(ChainController.state.activeCaipNetwork?.id)
    const activeChain = ChainController.state.activeChain

    if (!activeChain) {
      throw new Error('activeChain is required to check if smart account is enabled')
    }

    if (!networkId) {
      return false
    }

    const smartAccountEnabledNetworks = ChainController.getNetworkProp(
      'smartAccountEnabledNetworks'
    )

    return Boolean(smartAccountEnabledNetworks?.includes(Number(networkId)))
  },

  resetNetwork() {
    const chain = ChainController.state.activeChain

    if (!chain) {
      throw new Error('chain is required to reset network')
    }

    ChainController.setAdapterNetworkState(chain, {
      approvedCaipNetworkIds: undefined,
      supportsAllNetworks: true,
      smartAccountEnabledNetworks: []
    })
  },

  getSupportsAllNetworks() {
    const chain = ChainController.state.activeChain

    if (!chain) {
      throw new Error('chain is required to check if network supports all networks')
    }

    return ChainController.state.chains.get(chain)?.networkState?.supportsAllNetworks
  },

  showUnsupportedChainUI() {
    setTimeout(() => {
      ModalController.open({ view: 'UnsupportedChain' })
    }, 300)
  },

  getActiveNetworkTokenAddress() {
    const address =
      ConstantsUtil.NATIVE_TOKEN_ADDRESS[
        ChainController.state.activeCaipNetwork?.chainNamespace || 'eip155'
      ]

    return `${ChainController.state.activeCaipNetwork?.id || 'eip155:1'}:${address}`
  }
}
