import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { AdapterCore, CaipNetwork, CaipNetworkId } from '../utils/TypeUtil.js'
import { PublicStateController } from './PublicStateController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkUtil } from '@web3modal/common'
import { ConnectionController } from './ConnectionController.js'

// -- Types --------------------------------------------- //
export interface NetworkControllerClient {
  switchCaipNetwork: (network: ProtocolNetworks['caipNetwork']) => Promise<void>
  getApprovedCaipNetworksData: () => Promise<{
    approvedCaipNetworkIds: ProtocolNetworks['approvedCaipNetworkIds']
    supportsAllNetworks: NetworkControllerState['supportsAllNetworks']
  }>
}

type Protocol = 'evm' | 'solana' | 'bitcoin'

type ProtocolNetworks = {
  requestedCaipNetworks?: CaipNetwork[]
  approvedCaipNetworkIds?: CaipNetworkId[]
  caipNetwork?: CaipNetwork
}

export interface NetworkControllerState {
  supportsAllNetworks?: boolean
  isDefaultCaipNetwork: boolean
  isUnsupportedChain?: boolean
  allowUnsupportedChain?: boolean
  _client?: NetworkControllerClient
  networks: Record<Protocol, ProtocolNetworks>
  smartAccountEnabledNetworks?: number[]
  activeProtocol?: Protocol
  adapters?: Record<Protocol, any>
  adaptersV2?: AdapterCore[]
  adapter?: any
}

type StateKey = keyof NetworkControllerState

// -- State --------------------------------------------- //
const state = proxy<NetworkControllerState>({
  networks: {
    evm: {},
    solana: {},
    bitcoin: {}
  },
  supportsAllNetworks: true,
  isDefaultCaipNetwork: false,
  smartAccountEnabledNetworks: []
})

// -- Controller ---------------------------------------- //
export const NetworkController = {
  state,

  subscribe(callback: (newState: NetworkControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: NetworkControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  _getClient() {
    if (!state._client) {
      throw new Error('NetworkController client not set')
    }

    return state._client
  },

  activeNetwork() {
    if (!state.activeProtocol) {
      return undefined
    }

    return state.networks[state.activeProtocol].caipNetwork
  },

  setClient(client: NetworkControllerClient) {
    state._client = ref(client)
  },

  setAdapters(adapters: AdapterCore[]) {
    state.adaptersV2 = adapters
  },

  setAdapter(adapter: AdapterCore) {
    state.activeProtocol = adapter.protocol
    state.adapter = adapter

    // Update controller clients
    const { connectionControllerClient, networkControllerClient } = adapter

    if (connectionControllerClient) {
      ConnectionController.setClient(connectionControllerClient)
    }
    if (networkControllerClient) {
      NetworkController.setClient(networkControllerClient)
    }

    // Initialize adapter
    adapter.initialize()
  },

  setCaipNetwork(caipNetwork: ProtocolNetworks['caipNetwork'], protocol: Protocol) {
    state.networks[protocol].caipNetwork = caipNetwork
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id })
    if (!this.state.allowUnsupportedChain) {
      this.checkIfSupportedNetwork()
    }
  },

  setDefaultCaipNetwork(caipNetwork: ProtocolNetworks['caipNetwork'], protocol: Protocol) {
    state.networks[protocol].caipNetwork = caipNetwork
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id })
    state.isDefaultCaipNetwork = true
  },

  setRequestedCaipNetworks(
    requestedNetworks: ProtocolNetworks['requestedCaipNetworks'],
    protocol: Protocol
  ) {
    state.networks[protocol].requestedCaipNetworks = requestedNetworks
  },

  setAllowUnsupportedChain(allowUnsupportedChain: NetworkControllerState['allowUnsupportedChain']) {
    state.allowUnsupportedChain = allowUnsupportedChain
  },

  setSmartAccountEnabledNetworks(
    smartAccountEnabledNetworks: NetworkControllerState['smartAccountEnabledNetworks']
  ) {
    state.smartAccountEnabledNetworks = smartAccountEnabledNetworks
  },

  getRequestedCaipNetworks(protocol: Protocol) {
    const { approvedCaipNetworkIds, requestedCaipNetworks } = state.networks[protocol]

    const approvedIds = approvedCaipNetworkIds
    const requestedNetworks = requestedCaipNetworks

    return CoreHelperUtil.sortRequestedNetworks(approvedIds, requestedNetworks)
  },

  async getApprovedCaipNetworksData() {
    if (!state.activeProtocol) {
      return
    }
    const data = await this._getClient().getApprovedCaipNetworksData()
    state.supportsAllNetworks = data.supportsAllNetworks
    state.networks[state.activeProtocol].approvedCaipNetworkIds = data.approvedCaipNetworkIds
  },

  async switchActiveNetwork(network: ProtocolNetworks['caipNetwork']) {
    if (!state.adapter || !state.activeProtocol) {
      throw new Error('switchActiveNetwork - No active protocol')
    }
    await state.adapter.switchCaipNetwork(network)

    state.networks[state.activeProtocol].caipNetwork = network
    if (network) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SWITCH_NETWORK',
        properties: { network: network.id }
      })
    }
  },

  checkIfSupportedNetwork() {
    if (!state.activeProtocol) {
      return
    }
    const requestedNetworks = state.networks[state.activeProtocol].requestedCaipNetworks || []

    state.isUnsupportedChain = !requestedNetworks.some(
      // @ts-ignore
      network => network.id === this.activeNetwork()?.id
    )
    console.log(
      'isUnsupportedChain',
      state.activeProtocol,
      state.isUnsupportedChain,
      this.activeNetwork()?.id,
      requestedNetworks
    )
    if (state.isUnsupportedChain && this.activeNetwork()?.id) {
      this.showUnsupportedChainUI()
    }
  },

  checkIfSmartAccountEnabled() {
    if (!state.activeProtocol) {
      return false
    }
    const networkId = NetworkUtil.caipNetworkIdToNumber(this.activeNetwork()?.id)
    if (!networkId) {
      return false
    }

    return Boolean(state.smartAccountEnabledNetworks?.includes(networkId))
  },

  resetNetwork(protocol?: Protocol) {
    if (protocol) {
      const defaultNetwork = {
        approvedCaipNetworkIds: undefined
      }
      if (!state.isDefaultCaipNetwork) {
        state.networks[protocol].caipNetwork = undefined
      }

      state.networks[protocol] = defaultNetwork
    }
    state.networks = {
      evm: {},
      solana: {},
      bitcoin: {}
    }

    state.supportsAllNetworks = true
    state.smartAccountEnabledNetworks = []
  },

  showUnsupportedChainUI() {
    setTimeout(() => {
      ModalController.open({ view: 'UnsupportedChain' })
    }, 300)
  }
}
