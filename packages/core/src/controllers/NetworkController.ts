import { proxy, ref } from 'valtio/vanilla'
import { EventsController } from './EventsController.js'
import { type CaipNetwork, type CaipNetworkId } from '@reown/appkit-common'
import { ChainController } from './ChainController.js'

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
  }
}
