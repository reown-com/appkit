import { proxy } from 'valtio/vanilla'
import type { CaipNetwork, CaipNetworkId } from '../utils/TypeUtil.js'
import { PublicStateController } from './PublicStateController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkUtil, type Chain } from '@web3modal/common'
import { ChainController } from './ChainController.js'

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

  replaceState(newState: NetworkControllerState) {
    Object.assign(state, newState)
  },

  getProperty<K extends StateKey>(key: K): NetworkControllerState[K] | undefined {
    return ChainController.getNetworkProp(key)
  },

  subscribe(callback: (val: NetworkControllerState) => void) {
    return ChainController.subscribeChainProp('networkState', networkState => {
      if (networkState) {
        return callback(networkState)
      }
    })
  },

  subscribeKey<K extends keyof NetworkControllerState>(
    property: K,
    callback: (val: NetworkControllerState[K]) => void
  ) {
    let prev: NetworkControllerState[K] | undefined
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

  initializeDefaultNetwork() {
    const networks = this.getRequestedCaipNetworks()

    if (networks.length > 0) {
      this.setCaipNetwork(networks[0])
    }
  },

  setClient(client: NetworkControllerClient, chain?: Chain) {
    ChainController.updateChainNetworkData(
      ChainController.state.multiChainEnabled ? chain : 'evm',
      { _client: client }
    )
  },

  setCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    const chain = ChainController.state.multiChainEnabled ? caipNetwork?.chain : 'evm'

    if (!chain) {
      throw new Error('chain is required to set default network')
    }

    if (!caipNetwork) {
      throw new Error('caipNetwork is required to set active network')
    }

    ChainController.state.activeCaipNetwork = caipNetwork
    ChainController.state.activeChain = chain
    ChainController.updateChainNetworkData(chain, { caipNetwork })
    PublicStateController.set({ activeChain: chain, selectedNetworkId: caipNetwork?.id })

    if (!ChainController.state.chains.get(chain)?.networkState.allowUnsupportedChain) {
      this.checkIfSupportedNetwork()
    }
  },

  setDefaultCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork'], chain?: Chain) {
    const chainToSet = ChainController.state.multiChainEnabled ? chain : 'evm'

    if (!chainToSet) {
      throw new Error('chain is required to set default network')
    }

    ChainController.state.activeCaipNetwork = caipNetwork
    ChainController.state.activeChain = chainToSet
    ChainController.updateChainNetworkData(chainToSet, { caipNetwork, isDefaultCaipNetwork: true })
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id, activeChain: chain })
  },

  setRequestedCaipNetworks(
    requestedNetworks: NetworkControllerState['requestedCaipNetworks'],
    chain?: Chain
  ) {
    ChainController.updateChainNetworkData(
      ChainController.state.multiChainEnabled ? chain : 'evm',
      { requestedCaipNetworks: requestedNetworks }
    )
  },

  setAllowUnsupportedChain(
    allowUnsupportedChain: NetworkControllerState['allowUnsupportedChain'],
    chain?: Chain
  ) {
    ChainController.updateChainNetworkData(chain || 'evm', { allowUnsupportedChain })
  },

  setSmartAccountEnabledNetworks(
    smartAccountEnabledNetworks: NetworkControllerState['smartAccountEnabledNetworks'],
    chain?: Chain
  ) {
    ChainController.updateChainNetworkData(
      ChainController.state.multiChainEnabled ? chain : 'evm',
      { smartAccountEnabledNetworks }
    )
  },

  getRequestedCaipNetworks(chainToFilter?: Chain) {
    let chainAdapters: Chain[] | undefined

    if (chainToFilter) {
      let chain = ChainController.state.multiChainEnabled ? chainToFilter : 'evm'

      if (!chain) {
        throw new Error('chain is required to set default network')
      }

      chainAdapters = [chain]
    } else {
      if (ChainController.state.multiChainEnabled) {
        chainAdapters = Object.keys(ChainController.state.chains) as Chain[]
      } else {
        chainAdapters = ['evm']
      }
    }

    const approvedIds: `${string}:${string}`[] = []
    const requestedNetworks: CaipNetwork[] = []

    chainAdapters.forEach((chn: Chain) => {
      if (ChainController.state.chains.get(chn)?.networkState.approvedCaipNetworkIds) {
        approvedIds.push(
          ...(ChainController.state.chains.get(chn)?.networkState?.approvedCaipNetworkIds || [])
        )
      }
      if (ChainController.state.chains.get(chn)?.networkState.requestedCaipNetworks) {
        requestedNetworks.push(
          ...(ChainController.state.chains.get(chn)?.networkState?.requestedCaipNetworks || [])
        )
      }
    })

    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(approvedIds, requestedNetworks)

    return sortedNetworks
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork']) {
    const networkControllerClient = ChainController.getNetworkControllerClient()
    await networkControllerClient.switchCaipNetwork(network)

    let chain = ChainController.state.multiChainEnabled ? network?.chain : 'evm'

    if (!chain) {
      throw new Error('chain is required to set default network')
    }

    if (!network) {
      throw new Error('Network is required to switch active network')
    }

    ChainController.state.activeCaipNetwork = network
    ChainController.state.activeChain = chain
    ChainController.updateChainNetworkData(chain, { caipNetwork: network })
    PublicStateController.set({ activeChain: chain, selectedNetworkId: network.id })

    if (network) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SWITCH_NETWORK',
        properties: { network: network.id }
      })
    }
  },

  getApprovedCaipNetworkIds(chainToFilter?: Chain) {
    if (chainToFilter) {
      let chain = ChainController.state.multiChainEnabled ? chainToFilter : 'evm'

      if (!chain) {
        throw new Error('chain is required to set default network')
      }

      return ChainController.state.chains.get(chain)?.networkState.approvedCaipNetworkIds
    }

    // Otherwise, return all approved networks
    const allCaipNetworkIds: CaipNetworkId[] = []

    Object.values(ChainController.state.chains).forEach(adapter => {
      if (adapter.networkState.approvedCaipNetworkIds) {
        allCaipNetworkIds.push(...(adapter.networkState?.approvedCaipNetworkIds || []))
      }
    })

    return allCaipNetworkIds
  },

  async setApprovedCaipNetworksData(_chain?: Chain) {
    const networkControllerClient = ChainController.getNetworkControllerClient()
    const data = await networkControllerClient.getApprovedCaipNetworksData()

    let chain = ChainController.state.multiChainEnabled ? _chain : 'evm'

    if (!chain) {
      throw new Error('chain is required to set default network')
    }

    ChainController.updateChainNetworkData(chain, {
      approvedCaipNetworkIds: data?.approvedCaipNetworkIds,
      supportsAllNetworks: data?.supportsAllNetworks || false
    })
  },

  checkIfSupportedNetwork() {
    const chain = ChainController.state.multiChainEnabled
      ? ChainController.state.activeChain
      : 'evm'

    if (!chain) {
      return false
    }

    const activeCaipNetwork = ChainController.state.chains.get(chain)?.networkState.caipNetwork

    const requestedCaipNetworks = this.getRequestedCaipNetworks()

    return requestedCaipNetworks?.some(network => network.id === activeCaipNetwork?.id)
      ? false
      : true
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

    const smartAccountEnabledNetworks =
      ChainController.state.chains.get(activeChain)?.networkState.smartAccountEnabledNetworks || []

    return Boolean(smartAccountEnabledNetworks?.includes(networkId))
  },

  resetNetwork() {
    const chain = ChainController.state.multiChainEnabled
      ? ChainController.state.activeChain
      : 'evm'

    if (!chain) {
      throw new Error('chain is required to reset network')
    }

    if (!ChainController.state.chains.get(chain)?.networkState.isDefaultCaipNetwork) {
      ChainController.updateChainNetworkData(chain, { caipNetwork: undefined })
    }

    ChainController.updateChainNetworkData(chain, {
      approvedCaipNetworkIds: undefined,
      supportsAllNetworks: true,
      smartAccountEnabledNetworks: []
    })
  },

  getSupportsAllNetworks() {
    const chain = ChainController.state.multiChainEnabled
      ? ChainController.state.activeChain
      : 'evm'

    if (!chain) {
      throw new Error('chain is required to get getSupportsAllNetworks')
    }

    return ChainController.state.chains.get(chain)?.networkState.supportsAllNetworks
  },

  showUnsupportedChainUI() {
    setTimeout(() => {
      ModalController.open({ view: 'UnsupportedChain' })
    }, 300)
  },

  // -- New methods
  switchChain(newChain: Chain) {
    ChainController.state.activeChain = newChain
    this.setCaipNetwork(ChainController.state.chains.get(newChain)?.networkState.caipNetwork)
    PublicStateController.set({ activeChain: newChain })
  }
}
