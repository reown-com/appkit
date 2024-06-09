import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { CaipNetwork, CaipNetworkId } from '../utils/TypeUtil.js'
import { PublicStateController } from './PublicStateController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
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

  _getClient(chain?: Chain) {
    if (chain) {
      return ChainController.getNetworkControllerClient(chain)
    }

    // if (!state._client) {
    //   throw new Error('NetworkController client not set')
    // }

    return state._client
  },

  activeNetwork() {
    if (ChainController.state.multiChainEnabled) {
      return ChainController.activeNetwork()
    }

    return state.caipNetwork
  },

  setClient(client: NetworkControllerClient, chain?: Chain) {
    state._client = ref(client)
    if (chain) {
      ChainController.setClient(client, chain)
    }
  },

  setCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork'], chain?: Chain) {
    state.caipNetwork = caipNetwork
    // TODO(enes): check what to do for PublicStateController calls
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id })

    if (chain) {
      ChainController.setCaipNetwork(caipNetwork, chain)
    }

    if (!this.state.allowUnsupportedChain) {
      this.checkIfSupportedNetwork(chain)
    }
  },

  setDefaultCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork'], chain?: Chain) {
    state.caipNetwork = caipNetwork
    // TODO(enes): check what to do for PublicStateController calls
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id })
    state.isDefaultCaipNetwork = true
    if (chain) {
      ChainController.setDefaultCaipNetwork(caipNetwork, chain)
    }
  },

  setRequestedCaipNetworks(
    requestedNetworks: NetworkControllerState['requestedCaipNetworks'],
    chain?: Chain
  ) {
    state.requestedCaipNetworks = requestedNetworks
    if (chain) {
      ChainController.setRequestedCaipNetworks(requestedNetworks, chain)
    }
  },

  setAllowUnsupportedChain(
    allowUnsupportedChain: NetworkControllerState['allowUnsupportedChain'],
    chain?: Chain
  ) {
    state.allowUnsupportedChain = allowUnsupportedChain
    if (chain) {
      ChainController.setAllowUnsupportedChain(allowUnsupportedChain, chain)
    }
  },

  setSmartAccountEnabledNetworks(
    smartAccountEnabledNetworks: NetworkControllerState['smartAccountEnabledNetworks'],
    chain?: Chain
  ) {
    state.smartAccountEnabledNetworks = smartAccountEnabledNetworks
    if (chain) {
      ChainController.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks, chain)
    }
  },

  getRequestedCaipNetworks() {
    if (ChainController.state.multiChainEnabled) {
      return ChainController.getRequestedCaipNetworks()
    } else {
      const { approvedCaipNetworkIds, requestedCaipNetworks } = state

      const approvedIds = approvedCaipNetworkIds
      const requestedNetworks = requestedCaipNetworks

      return CoreHelperUtil.sortRequestedNetworks(approvedIds, requestedNetworks)
    }
  },

  getSupportsAllNetworks() {
    if (ChainController.state.multiChainEnabled) {
      return ChainController.getSupportsAllNetworks()
    } else {
      return state.supportsAllNetworks
    }
  },

  getApprovedCaipNetworkIds(chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      return ChainController.getApprovedCaipNetworkIds(chain)
    }

    return state.approvedCaipNetworkIds
  },

  async setApprovedCaipNetworksData(chain?: Chain) {
    const data = await this._getClient(chain)?.getApprovedCaipNetworksData()

    state.supportsAllNetworks = data?.supportsAllNetworks || false
    state.approvedCaipNetworkIds = data?.approvedCaipNetworkIds || []

    if (chain) {
      ChainController.setApprovedCaipNetworksData(data, chain)
    }
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork'], chain?: Chain) {
    await this._getClient(chain)?.switchCaipNetwork(network)

    state.caipNetwork = network

    if (chain) {
      ChainController.switchActiveNetwork(network, chain)
    }

    if (network) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SWITCH_NETWORK',
        properties: { network: network.id }
      })
    }
  },

  checkIfSupportedNetwork(chain?: Chain) {
    if (chain) {
      state.isUnsupportedChain = ChainController.checkIfSupportedNetwork(
        chain,
        state.caipNetwork?.id
      )
    } else {
      state.isUnsupportedChain = !state.requestedCaipNetworks?.some(
        network => network.id === state.caipNetwork?.id
      )
    }

    if (state.isUnsupportedChain) {
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

  resetNetwork(chain?: Chain) {
    if (!state.isDefaultCaipNetwork) {
      state.caipNetwork = undefined
    }
    state.approvedCaipNetworkIds = undefined
    state.supportsAllNetworks = true
    state.smartAccountEnabledNetworks = []

    if (chain) {
      ChainController.resetNetwork(chain)
    }
  },

  showUnsupportedChainUI() {
    setTimeout(() => {
      ModalController.open({ view: 'UnsupportedChain' })
    }, 300)
  }
}
