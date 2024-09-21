import { proxy } from 'valtio/vanilla'
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
  switchCaipNetwork: (network: CaipNetwork) => Promise<void>
  getApprovedCaipNetworksData: () => Promise<{
    approvedCaipNetworkIds: NetworkControllerState['approvedCaipNetworkIds']
    supportsAllNetworks: NetworkControllerState['supportsAllNetworks']
  }>
}

export interface NetworkControllerState {
  _client?: NetworkControllerClient
  supportsAllNetworks: boolean
  requestedCaipNetworks?: CaipNetwork[]
  approvedCaipNetworkIds?: CaipNetworkId[]
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

  setAllowUnsupportedChain(
    allowUnsupportedCaipNetwork: NetworkControllerState['allowUnsupportedCaipNetwork'],
    chain: ChainNamespace | undefined
  ) {
    ChainController.setChainNetworkData(chain || ChainController.state.activeChain, {
      allowUnsupportedCaipNetwork
    })
  },

  setSmartAccountEnabledNetworks(
    smartAccountEnabledNetworks: NetworkControllerState['smartAccountEnabledNetworks'],
    chain: ChainNamespace | undefined
  ) {
    ChainController.setChainNetworkData(chain, { smartAccountEnabledNetworks })
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

    ChainController.setChainNetworkData(chain, {
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

  getActiveNetworkTokenAddress() {
    const address =
      ConstantsUtil.NATIVE_TOKEN_ADDRESS[
        ChainController.state.activeCaipNetwork?.chainNamespace || 'eip155'
      ]

    return `${ChainController.state.activeCaipNetwork?.id || 'eip155:1'}:${address}`
  }
}
