import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { CaipNetwork, CaipNetworkId } from '../utils/TypeUtil.js'
import { PublicStateController } from './PublicStateController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkUtil } from '@web3modal/common'

// -- Types --------------------------------------------- //
export interface NetworkControllerClient {
  switchCaipNetwork: (network: NetworkControllerState['caipNetwork']) => Promise<void>
  getApprovedCaipNetworksData: () => Promise<{
    approvedCaipNetworkIds: ProtocolNetworks['approvedCaipNetworkIds']
    supportsAllNetworks: NetworkControllerState['supportsAllNetworks']
  }>
}

type Protocol = 'evm' | 'solana' | 'bitcoin'

type ProtocolNetworks = {
  requestedCaipNetworks?: CaipNetwork[]
  approvedCaipNetworkIds?: CaipNetworkId[]
}

export interface NetworkControllerState {
  caipNetwork?: CaipNetwork
  supportsAllNetworks?: boolean
  isDefaultCaipNetwork: boolean
  isUnsupportedChain?: boolean
  allowUnsupportedChain?: boolean
  _client?: NetworkControllerClient
  networks: Record<Protocol, ProtocolNetworks>
  smartAccountEnabledNetworks?: number[]
  activeProtocol?: Protocol
  adapters?: Record<Protocol, any>
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

  setClient(client: NetworkControllerClient) {
    state._client = ref(client)
  },

  setAdapters(adapters: any[]) {
    state.adapters = adapters.reduce(
      (adapter, acum) => ({ ...acum, [adapter.protocol]: adapter }),
      {}
    )
  },

  switchProtocol(protocol: Protocol) {
    state.activeProtocol = protocol
    state.adapter = state.adapters?.[protocol]
  },

  setCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    state.caipNetwork = caipNetwork
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id })
    if (!this.state.allowUnsupportedChain) {
      this.checkIfSupportedNetwork()
    }
  },

  setDefaultCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    state.caipNetwork = caipNetwork
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

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork']) {
    if (!state.adapter || !state.activeProtocol) {
      throw new Error('switchActiveNetwork - No active protocol')
    }
    await state.adapter.switchCaipNetwork(network)

    state.caipNetwork = network
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
      network => network.id === state.caipNetwork?.id
    )

    if (state.isUnsupportedChain) {
      this.showUnsupportedChainUI()
    }
  },

  checkIfSmartAccountEnabled() {
    if (!state.activeProtocol) {
      return false
    }
    const networkId = NetworkUtil.caipNetworkIdToNumber(state.caipNetwork?.id)
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
        state.caipNetwork = undefined
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
