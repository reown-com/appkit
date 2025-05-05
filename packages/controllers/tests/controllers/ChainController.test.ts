import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil,
  SafeLocalStorageKeys
} from '@reown/appkit-common'
import { SafeLocalStorage } from '@reown/appkit-common'

import {
  AccountController,
  type ChainAdapter,
  type NetworkControllerClient
} from '../../exports/index.js'
import { ChainController } from '../../src/controllers/ChainController.js'
import { type ConnectionControllerClient } from '../../src/controllers/ConnectionController.js'
import { ConnectionController } from '../../src/controllers/ConnectionController.js'
import { EventsController } from '../../src/controllers/EventsController.js'
import { RouterController } from '../../src/controllers/RouterController.js'
import { StorageUtil } from '../../src/utils/StorageUtil.js'

// -- Setup --------------------------------------------------------------------
const chainNamespace = 'eip155' as ChainNamespace
const caipAddress = 'eip155:1:0x123'
const approvedCaipNetworkIds = ['eip155:1', 'eip155:4'] as CaipNetworkId[]

const requestedCaipNetworks = [
  {
    id: 1,
    caipNetworkId: 'eip155:1',
    name: 'Ethereum',
    chainNamespace: ConstantsUtil.CHAIN.EVM,
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: {
      default: { http: ['https://rpc.infura.com/v1/'] }
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://etherscan.io' }
    }
  },
  {
    id: 42161,
    caipNetworkId: 'eip155:42161',
    name: 'Arbitrum One',
    chainNamespace: ConstantsUtil.CHAIN.EVM,
    nativeCurrency: {
      name: 'Arbitrum',
      symbol: 'ARB',
      decimals: 18
    },
    rpcUrls: {
      default: { http: ['https://rpc.infura.com/v1/'] }
    },
    blockExplorers: {
      default: { name: 'Arbitrum Explorer', url: 'https://explorer.arbitrum.io' }
    }
  },
  {
    id: 43114,
    caipNetworkId: 'eip155:43114',
    name: 'Avalanche C-Chain',
    chainNamespace: ConstantsUtil.CHAIN.EVM,
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: {
      default: { http: ['https://rpc.infura.com/v1/'] }
    },
    blockExplorers: {
      default: { name: 'Avalanche C-Chain', url: 'https://cchain.explorer.avax.network' }
    }
  }
] as CaipNetwork[]

const mainnetCaipNetwork = {
  id: 1,
  name: 'Ethereum',
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  caipNetworkId: 'eip155:1',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.infura.com/v1/'] } },
  blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } }
} as const

const solanaCaipNetwork = {
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  chainNamespace: ConstantsUtil.CHAIN.SOLANA,
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: { default: { http: ['https://rpc.infura.com/v1/'] } },
  blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } }
} as const

const connectionControllerClient: ConnectionControllerClient = {
  connectWalletConnect: async () => Promise.resolve(),
  disconnect: async () => Promise.resolve(),
  estimateGas: async () => Promise.resolve(BigInt(0)),
  signMessage: async (message: string) => Promise.resolve(message),
  parseUnits: value => BigInt(value),
  formatUnits: value => value.toString(),
  sendTransaction: () => Promise.resolve('0x'),
  writeContract: () => Promise.resolve('0x'),
  getEnsAddress: async (value: string) => Promise.resolve(value),
  getEnsAvatar: async (value: string) => Promise.resolve(value),
  getCapabilities: async () => Promise.resolve(''),
  grantPermissions: async () => Promise.resolve(''),
  revokePermissions: async () => Promise.resolve('0x'),
  walletGetAssets: async () => Promise.resolve({})
}

const networkControllerClient: NetworkControllerClient = {
  switchCaipNetwork: async _caipNetwork => Promise.resolve(),
  getApprovedCaipNetworksData: async () =>
    Promise.resolve({ approvedCaipNetworkIds: [], supportsAllNetworks: false })
}

const evmAdapter = {
  namespace: ConstantsUtil.CHAIN.EVM,
  connectionControllerClient,
  networkControllerClient,
  caipNetworks: [mainnetCaipNetwork]
}

const solanaAdapter = {
  namespace: ConstantsUtil.CHAIN.SOLANA,
  connectionControllerClient,
  networkControllerClient,
  caipNetworks: [solanaCaipNetwork] as unknown as CaipNetwork[]
}

beforeEach(() => {
  vi.resetAllMocks()
  ChainController.state.noAdapters = false
  ChainController.initialize([evmAdapter], requestedCaipNetworks, {
    connectionControllerClient,
    networkControllerClient
  })
})

// -- Tests --------------------------------------------------------------------
describe('ChainController', () => {
  it('should be initialized as expected', () => {
    expect(ChainController.state.activeChain).toEqual(ConstantsUtil.CHAIN.EVM)
    expect(ChainController.getConnectionControllerClient()).toEqual(connectionControllerClient)
    expect(ChainController.getNetworkControllerClient()).toEqual(networkControllerClient)
  })

  it('should update account state as expected', () => {
    ChainController.setAccountProp('caipAddress', caipAddress, chainNamespace)
    expect(ChainController.getAccountProp('caipAddress')).toEqual(caipAddress)
  })

  it('should update network state as expected', () => {
    ChainController.setAdapterNetworkState(ConstantsUtil.CHAIN.EVM, {
      approvedCaipNetworkIds
    })
    expect(
      ChainController.getNetworkProp('approvedCaipNetworkIds', ConstantsUtil.CHAIN.EVM)
    ).toEqual(approvedCaipNetworkIds)
  })

  it('should update state correctly on setApprovedCaipNetworkIds()', async () => {
    const networkController = { ...networkControllerClient }
    const networkControllerSpy = vi
      .spyOn(networkController, 'getApprovedCaipNetworksData')
      .mockResolvedValueOnce({
        approvedCaipNetworkIds,
        supportsAllNetworks: false
      })
    const evmAdapter = {
      namespace: chainNamespace,
      connectionControllerClient,
      networkControllerClient: networkController,
      caipNetworks: [] as CaipNetwork[]
    }

    // Need to re-initialize to set the spy properly
    ChainController.initialize([evmAdapter], requestedCaipNetworks, {
      connectionControllerClient,
      networkControllerClient: networkController
    })
    await ChainController.setApprovedCaipNetworksData(chainNamespace)

    expect(ChainController.getApprovedCaipNetworkIds(chainNamespace)).toEqual(
      approvedCaipNetworkIds
    )
    expect(networkControllerSpy).toHaveBeenCalled()
  })

  it('should update state correctly on setCaipNetwork()', () => {
    ChainController.setActiveCaipNetwork({
      id: 1,
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      caipNetworkId: 'eip155:1',
      name: 'Ethereum',
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://rpc.infura.com/v1/'] } },
      blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } }
    })
    expect(ChainController.state.activeCaipNetwork).toEqual(mainnetCaipNetwork)
  })

  it('should check correctly if smart accounts are enabled on the network', () => {
    ChainController.setActiveCaipNetwork(mainnetCaipNetwork)
    ChainController.setSmartAccountEnabledNetworks([1], chainNamespace)
    expect(ChainController.checkIfSmartAccountEnabled()).toEqual(true)
    ChainController.setSmartAccountEnabledNetworks([], chainNamespace)
    expect(ChainController.checkIfSmartAccountEnabled()).toEqual(false)
    ChainController.setSmartAccountEnabledNetworks([2], chainNamespace)
    expect(ChainController.checkIfSmartAccountEnabled()).toEqual(false)
    ChainController.setActiveCaipNetwork({
      id: 2,
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      caipNetworkId: 'eip155:2',
      name: 'Ethereum',
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://rpc.infura.com/v1/'] } },
      blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } }
    })
  })

  it('should check if network supports names feature', () => {
    ChainController.setActiveCaipNetwork(mainnetCaipNetwork)
    expect(ChainController.checkIfNamesSupported()).toEqual(true)
    ChainController.setActiveCaipNetwork(solanaCaipNetwork)
    expect(ChainController.checkIfNamesSupported()).toEqual(false)
  })

  it('should get correct active network token address', () => {
    let mock = vi
      .spyOn(ChainController.state, 'activeCaipNetwork', 'get')
      .mockReturnValue(undefined)
    expect(ChainController.getActiveNetworkTokenAddress()).toEqual(
      'eip155:1:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    )

    mock.mockReturnValue(mainnetCaipNetwork)
    expect(ChainController.getActiveNetworkTokenAddress()).toEqual(
      'eip155:1:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    )

    mock.mockReturnValue(solanaCaipNetwork)
    expect(ChainController.getActiveNetworkTokenAddress()).toEqual(
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:So11111111111111111111111111111111111111111'
    )

    mock.mockClear()
  })

  it('should update state correctly on setRequestedCaipNetworks()', () => {
    ChainController.setRequestedCaipNetworks(requestedCaipNetworks, chainNamespace)
    const requestedNetworks = ChainController.getRequestedCaipNetworks(chainNamespace)
    expect(requestedNetworks).toEqual(requestedCaipNetworks)
  })

  it('should reset state correctly on resetNetwork()', () => {
    const namespace = 'eip155'
    ChainController.resetNetwork(namespace)
    const requestedCaipNetworks = ChainController.getRequestedCaipNetworks(namespace)
    const approvedCaipNetworkIds = ChainController.getApprovedCaipNetworkIds(namespace)
    const smartAccountEnabledNetworks = ChainController.getNetworkProp(
      'smartAccountEnabledNetworks',
      chainNamespace
    )
    expect(approvedCaipNetworkIds).toEqual([])
    expect(requestedCaipNetworks).toEqual(requestedCaipNetworks)
    expect(smartAccountEnabledNetworks).toEqual([])
  })

  it('should reset account as expected', () => {
    ChainController.resetAccount(chainNamespace)
    expect(AccountController.state.smartAccountDeployed).toEqual(false)
    expect(AccountController.state.currentTab).toEqual(0)
    expect(AccountController.state.caipAddress).toEqual(undefined)
    expect(AccountController.state.address).toEqual(undefined)
    expect(AccountController.state.balance).toEqual(undefined)
    expect(AccountController.state.balanceSymbol).toEqual(undefined)
    expect(AccountController.state.profileName).toEqual(undefined)
    expect(AccountController.state.profileImage).toEqual(undefined)
    expect(AccountController.state.addressExplorerUrl).toEqual(undefined)
    expect(AccountController.state.tokenBalance).toEqual([])
    expect(AccountController.state.connectedWalletInfo).toEqual(undefined)
    expect(AccountController.state.preferredAccountTypes).toEqual(undefined)
    expect(AccountController.state.status).toEqual('disconnected')
    expect(AccountController.state.socialProvider).toEqual(undefined)
    expect(AccountController.state.socialWindow).toEqual(undefined)
  })

  it('Expect modal to close after switching from unsupported network to supported network', async () => {
    // Mock RouterController.goBack
    const routerGoBackSpy = vi.spyOn(RouterController, 'goBack')

    // Setup adapter with limited network support
    const limitedEvmAdapter = {
      namespace: ConstantsUtil.CHAIN.EVM,
      connectionControllerClient,
      networkControllerClient,
      caipNetworks: [
        {
          id: 1,
          caipNetworkId: 'eip155:1',
          name: 'Ethereum',
          chainNamespace: ConstantsUtil.CHAIN.EVM
        }
      ] as unknown as CaipNetwork[]
    }

    ChainController.state.activeCaipNetwork = {
      id: 42161,
      caipNetworkId: 'eip155:42161',
      name: 'Arbitrum One',
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      nativeCurrency: {
        name: 'Arbitrum',
        symbol: 'ARB',
        decimals: 18
      }
    } as unknown as CaipNetwork
    ChainController.state.chains.set(ConstantsUtil.CHAIN.EVM, limitedEvmAdapter)
    await ChainController.switchActiveNetwork(mainnetCaipNetwork)

    expect(routerGoBackSpy).toHaveBeenCalled()

    routerGoBackSpy.mockRestore()
  })

  it('should initialize with active network from local storage', () => {
    const getItemSpy = vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('eip155')

    ChainController.initialize([evmAdapter], requestedCaipNetworks, {
      connectionControllerClient,
      networkControllerClient
    })

    expect(getItemSpy).toHaveBeenCalledWith(SafeLocalStorageKeys.ACTIVE_NAMESPACE)
    expect(ChainController.state.activeChain).toEqual(ConstantsUtil.CHAIN.EVM)

    getItemSpy.mockRestore()
  })

  it('should initialize with first adapter when stored network not found', () => {
    const getItemSpy = vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('solana')

    ChainController.initialize([solanaAdapter, evmAdapter], requestedCaipNetworks, {
      connectionControllerClient,
      networkControllerClient
    })

    expect(getItemSpy).toHaveBeenCalledWith(SafeLocalStorageKeys.ACTIVE_NAMESPACE)
    expect(ChainController.state.activeChain).toEqual(ConstantsUtil.CHAIN.SOLANA)

    getItemSpy.mockRestore()
  })

  it('should set noAdapters flag when no adapters provided', () => {
    ChainController.initialize([], requestedCaipNetworks, {
      connectionControllerClient,
      networkControllerClient
    })
    expect(ChainController.state.noAdapters).toBe(true)
  })

  it('should set noAdapters flag when no adapter provided', () => {
    ChainController.initialize([], requestedCaipNetworks, {
      connectionControllerClient,
      networkControllerClient
    })
    expect(ChainController.state.noAdapters).toBe(true)
  })

  it('should properly handle disconnect', async () => {
    const resetAccountSpy = vi.spyOn(ChainController, 'resetAccount')
    const resetNetworkSpy = vi.spyOn(ChainController, 'resetNetwork')
    const deleteConnectedSocialProviderSpy = vi.spyOn(StorageUtil, 'deleteConnectedSocialProvider')
    const resetWcConnectionSpy = vi.spyOn(ConnectionController, 'resetWcConnection')
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')

    const connectionController = {
      ...connectionControllerClient,
      disconnect: vi.fn()
    }

    const evmAdapterCustom = {
      ...evmAdapter,
      connectionControllerClient: connectionController
    }

    const solanaAdapterCustom = {
      ...solanaAdapter,
      connectionControllerClient: connectionController
    }

    ChainController.initialize(
      [evmAdapterCustom, solanaAdapterCustom],
      [...requestedCaipNetworks, solanaCaipNetwork],
      {
        connectionControllerClient: connectionController,
        networkControllerClient
      }
    )
    ChainController.state.chains.set(ConstantsUtil.CHAIN.EVM, {
      ...evmAdapterCustom,
      accountState: {
        caipAddress: 'eip155:1'
      }
    } as unknown as ChainAdapter)
    ChainController.state.chains.set(ConstantsUtil.CHAIN.SOLANA, {
      ...solanaAdapterCustom,
      accountState: {
        caipAddress: 'solana:1'
      }
    } as unknown as ChainAdapter)

    await ChainController.disconnect()

    expect(connectionController.disconnect).toHaveBeenCalledTimes(2)

    expect(resetAccountSpy).toHaveBeenCalledWith(ConstantsUtil.CHAIN.EVM)
    expect(resetAccountSpy).toHaveBeenCalledWith(ConstantsUtil.CHAIN.SOLANA)
    expect(resetNetworkSpy).toHaveBeenCalledWith(ConstantsUtil.CHAIN.EVM)
    expect(resetNetworkSpy).toHaveBeenCalledWith(ConstantsUtil.CHAIN.SOLANA)

    expect(deleteConnectedSocialProviderSpy).toHaveBeenCalled()
    expect(resetWcConnectionSpy).toHaveBeenCalled()

    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'DISCONNECT_SUCCESS',
      properties: {
        namespace: 'all'
      }
    })

    resetAccountSpy.mockRestore()
    resetNetworkSpy.mockRestore()
    resetWcConnectionSpy.mockRestore()
    sendEventSpy.mockRestore()
  })

  it('should handle disconnect errors gracefully', async () => {
    const evmConnectionController = {
      disconnect: vi.fn().mockRejectedValue(new Error('EVM disconnect failed'))
    } as unknown as ConnectionControllerClient

    const customEvmAdapter = {
      ...evmAdapter,
      connectionControllerClient: evmConnectionController
    }

    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    ChainController.initialize([customEvmAdapter as any], requestedCaipNetworks, {
      connectionControllerClient: evmConnectionController,
      networkControllerClient
    })

    ChainController.state.chains.set(ConstantsUtil.CHAIN.EVM, {
      ...customEvmAdapter,
      accountState: {
        caipAddress: 'eip155:1'
      }
    } as unknown as ChainAdapter)

    await ChainController.disconnect()

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('EVM disconnect failed'))
    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'DISCONNECT_ERROR',
      properties: {
        message: expect.stringContaining('EVM disconnect failed')
      }
    })
    expect(sendEventSpy).not.toHaveBeenCalledWith({
      type: 'track',
      event: 'DISCONNECT_SUCCESS'
    })

    sendEventSpy.mockRestore()
    consoleSpy.mockRestore()
  })
})
