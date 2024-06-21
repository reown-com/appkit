import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import type { CaipNetwork, CaipNetworkId } from '../utils/TypeUtil.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { NetworkUtil } from '@web3modal/common'
import { ChainController, type Chain } from './ChainController.js'

// -- Types --------------------------------------------- //
export interface NetworkControllerClient {
  switchCaipNetwork: (network: NetworkControllerState['caipNetwork']) => Promise<void>
  getApprovedCaipNetworksData: () => Promise<{
    approvedCaipNetworkIds: NetworkControllerState['approvedCaipNetworkIds']
    supportsAllNetworks: NetworkControllerState['supportsAllNetworks']
  }>
}

export interface NetworkControllerState {
  supportsAllNetworks: boolean
  isDefaultCaipNetwork: boolean
  isUnsupportedChain?: boolean
  _client?: NetworkControllerClient
  caipNetwork?: CaipNetwork
  requestedCaipNetworks?: CaipNetwork[]
  approvedCaipNetworkIds?: CaipNetworkId[]
  allowUnsupportedChain?: boolean
  smartAccountEnabledNetworks?: number[]
}

type StateKey = keyof NetworkControllerState

// -- State --------------------------------------------- //
const state = proxy<NetworkControllerState>({
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

  getProperty<K extends StateKey>(key: K): NetworkControllerState[K] {
    // @ts-ignore
    return ChainController.getNetworkProp(key)
  },

  _getClient() {
    return ChainController.getNetworkControllerClient()
  },

  activeNetwork() {
    return ChainController.activeNetwork()
  },

  setClient(client: NetworkControllerClient, chain?: Chain) {
    ChainController.setClient(client, chain)
  },

  setCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    ChainController.setCaipNetwork(caipNetwork)
  },

  setDefaultCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork'], chain?: Chain) {
    ChainController.setDefaultCaipNetwork(caipNetwork, chain)
  },

  setRequestedCaipNetworks(
    requestedNetworks: NetworkControllerState['requestedCaipNetworks'],
    chain?: Chain
  ) {
    ChainController.setRequestedCaipNetworks(requestedNetworks, chain)
  },

  setAllowUnsupportedChain(
    allowUnsupportedChain: NetworkControllerState['allowUnsupportedChain'],
    chain?: Chain
  ) {
    ChainController.setAllowUnsupportedChain(allowUnsupportedChain, chain)
  },

  setSmartAccountEnabledNetworks(
    smartAccountEnabledNetworks: NetworkControllerState['smartAccountEnabledNetworks'],
    chain?: Chain
  ) {
    ChainController.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks, chain)
  },

  getRequestedCaipNetworks() {
    return ChainController.getRequestedCaipNetworks()
  },

  getSupportsAllNetworks() {
    return ChainController.getSupportsAllNetworks()
  },

  getApprovedCaipNetworkIds(chain?: Chain) {
    return ChainController.getApprovedCaipNetworkIds(chain)
  },

  async setApprovedCaipNetworksData(chain?: Chain) {
    const data = await this._getClient()?.getApprovedCaipNetworksData()

    ChainController.setApprovedCaipNetworksData(data, chain)
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork']) {
    await this._getClient()?.switchCaipNetwork(network)

    ChainController.switchActiveNetwork(network)

    if (network) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SWITCH_NETWORK',
        properties: { network: network.id }
      })
    }
  },

  checkIfSupportedNetwork() {
    const isUnsupportedChain = ChainController.checkIfSupportedNetwork()

    if (isUnsupportedChain) {
      this.showUnsupportedChainUI()
    }
  },

  checkIfSmartAccountEnabled() {
    const networkId = NetworkUtil.caipNetworkIdToNumber(state.caipNetwork?.id)

    if (!networkId) {
      return false
    }

    return Boolean(state.smartAccountEnabledNetworks?.includes(networkId))
  },

  resetNetwork() {
    ChainController.resetNetwork()
  },

  showUnsupportedChainUI() {
    setTimeout(() => {
      ModalController.open({ view: 'UnsupportedChain' })
    }, 300)
  }
}
