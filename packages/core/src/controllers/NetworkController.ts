import { proxy, ref } from 'valtio/vanilla'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { PEANUT_CONTRACTS } from '@squirrel-labs/peanut-sdk'
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
    approvedCaipNetworkIds: NetworkControllerState['approvedCaipNetworkIds']
    supportsAllNetworks: NetworkControllerState['supportsAllNetworks']
  }>
}

export interface NetworkControllerState {
  supportsAllNetworks: boolean
  isUnsupportedChain?: boolean
  _client?: NetworkControllerClient
  caipNetwork?: CaipNetwork
  requestedCaipNetworks?: CaipNetwork[]
  approvedCaipNetworkIds?: CaipNetworkId[]
  allowUnsupportedCaipNetwork?: boolean
  smartAccountEnabledNetworks?: number[]
  isPeanutSupportedChain?: boolean
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
    this.checkIfPeanutSupportsNetwork()
  },

    if (!caipNetwork?.chainNamespace) {
      throw new Error('chain is required to set active network')
    }

    ChainController.setCaipNetwork(caipNetwork?.chainNamespace, caipNetwork)
  },

  setRequestedCaipNetworks(
    requestedNetworks: NetworkControllerState['requestedCaipNetworks'],
    chain: ChainNamespace | undefined
  ) {
    ChainController.setChainNetworkData(chain, { requestedCaipNetworks: requestedNetworks })
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

  getRequestedCaipNetworks(chainToFilter?: ChainNamespace) {
    let chainAdapters: ChainNamespace[] | undefined = undefined

    if (!ChainController.state.activeChain) {
      throw new Error('activeChain is required to get requested networks')
    }

    if (chainToFilter) {
      const chain = chainToFilter

      if (!chain) {
        throw new Error('chain is required to get requested networks')
      }

      chainAdapters = [chain]
    } else {
      const chains = [...ChainController.state.chains.keys()]

      chainAdapters = chains
    }

    const approvedIds: `${string}:${string}`[] = []
    const requestedNetworks: CaipNetwork[] = []

    chainAdapters.forEach((chn: ChainNamespace) => {
      if (ChainController.state.chains.get(chn)?.networkState?.approvedCaipNetworkIds) {
        approvedIds.push(
          ...(ChainController.state.chains.get(chn)?.networkState?.approvedCaipNetworkIds || [])
        )
      }
      if (ChainController.state.chains.get(chn)?.networkState?.requestedCaipNetworks) {
        requestedNetworks.push(
          ...(ChainController.state.chains.get(chn)?.networkState?.requestedCaipNetworks || [])
        )
      }
    })

    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(approvedIds, requestedNetworks)

    return sortedNetworks
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

  getApprovedCaipNetworkIds(chainToFilter?: ChainNamespace) {
    if (chainToFilter) {
      const chain = chainToFilter

      if (!chain) {
        throw new Error('chain is required to get approved network IDs')
      }

      return ChainController.state.chains.get(chain)?.networkState?.approvedCaipNetworkIds
    }

    const allCaipNetworkIds: CaipNetworkId[] = []

    Object.values(ChainController.state.chains).forEach(adapter => {
      if (adapter.networkState.approvedCaipNetworkIds) {
        allCaipNetworkIds.push(...(adapter.networkState?.approvedCaipNetworkIds || []))
      }
    })

    return allCaipNetworkIds
  },

  async setApprovedCaipNetworksData(chain: ChainNamespace | undefined) {
    if (!chain) {
      throw new Error('chain is required to set approved network data')
    }

    const networkControllerClient = ChainController.getNetworkControllerClient()
    const data = await networkControllerClient?.getApprovedCaipNetworksData()

    ChainController.setChainNetworkData(chain, data)
  },

  checkIfSupportedNetwork() {
    const chain = ChainController.state.activeChain

    if (!chain) {
      return false
    }

    const activeCaipNetwork = ChainController.state.activeCaipNetwork
    const requestedCaipNetworks = this.getRequestedCaipNetworks(chain)

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

  checkIfPeanutSupportsNetwork() {
    const networkId = NetworkUtil.caipNetworkIdToNumber(state.caipNetwork?.id)

    if (PEANUT_CONTRACTS.hasOwnProperty(networkId)) {
      state.isPeanutSupportedChain = true
    } else {
      state.isPeanutSupportedChain = false
    }
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
