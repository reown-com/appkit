import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type CaipNetwork,
  type CaipNetworkId,
  ConstantsUtil,
  SafeLocalStorageKeys
} from '@reown/appkit-common'
import { SafeLocalStorage } from '@reown/appkit-common'

import {
  CoreHelperUtil,
  ModalController,
  type NetworkControllerClient,
  OptionsController
} from '../../exports/index.js'
import { ChainController } from '../../src/controllers/ChainController.js'
import { type ConnectionControllerClient } from '../../src/controllers/ConnectionController.js'
import { getActiveNetworkTokenAddress } from '../../src/utils/ChainControllerUtil.js'

// -- Setup --------------------------------------------------------------------
const chainNamespace = ConstantsUtil.CHAIN.EVM
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
  disconnectConnector: async () => Promise.resolve(),
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
  walletGetAssets: async () => Promise.resolve({}),
  updateBalance: () => Promise.resolve()
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

// -- Tests --------------------------------------------------------------------
describe('ChainController', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    ChainController.state.noAdapters = false
    ChainController.initialize([evmAdapter], requestedCaipNetworks, {
      connectionControllerClient,
      networkControllerClient
    })
  })

  it('should be initialized as expected', () => {
    expect(ChainController.state.activeChain).toEqual(ConstantsUtil.CHAIN.EVM)
    expect(ChainController.getConnectionControllerClient()).toEqual(connectionControllerClient)
    expect(ChainController.getNetworkControllerClient()).toEqual(networkControllerClient)
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
    expect(getActiveNetworkTokenAddress()).toEqual(
      'eip155:1:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    )

    mock.mockReturnValue(mainnetCaipNetwork)
    expect(getActiveNetworkTokenAddress()).toEqual(
      'eip155:1:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    )

    mock.mockReturnValue(solanaCaipNetwork)
    expect(getActiveNetworkTokenAddress()).toEqual(
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:So11111111111111111111111111111111111111111'
    )

    mock.mockClear()
  })

  it('should update state correctly on setRequestedCaipNetworks()', () => {
    ChainController.setRequestedCaipNetworks(requestedCaipNetworks, chainNamespace)
    const requestedNetworks = ChainController.getRequestedCaipNetworks(chainNamespace)
    expect(requestedNetworks).toEqual(requestedCaipNetworks)
  })

  it('should filter out networks without id values in getRequestedCaipNetworks', () => {
    const chainNamespace = ConstantsUtil.CHAIN.EVM
    const networksWithMissingId = [
      ...requestedCaipNetworks,
      {
        caipNetworkId: 'eip155:999',
        name: 'Test Network',
        chainNamespace: ConstantsUtil.CHAIN.EVM,
        nativeCurrency: { name: 'Test', symbol: 'TST', decimals: 18 },
        rpcUrls: { default: { http: ['https://rpc.test.com/v1/'] } },
        blockExplorers: { default: { name: 'Test Explorer', url: 'https://explorer.test.io' } }
      }
    ]

    ChainController.setRequestedCaipNetworks(networksWithMissingId as CaipNetwork[], chainNamespace)
    const filteredNetworks = ChainController.getRequestedCaipNetworks(chainNamespace)

    expect(filteredNetworks).toEqual(requestedCaipNetworks)
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
    const accountState = ChainController.getAccountData()
    expect(accountState?.smartAccountDeployed).toEqual(false)
    expect(accountState?.currentTab).toEqual(0)
    expect(accountState?.caipAddress).toEqual(undefined)
    expect(accountState?.balance).toEqual(undefined)
    expect(accountState?.balanceSymbol).toEqual(undefined)
    expect(accountState?.profileName).toEqual(undefined)
    expect(accountState?.profileImage).toEqual(undefined)
    expect(accountState?.addressExplorerUrl).toEqual(undefined)
    expect(accountState?.tokenBalance).toEqual([])
    expect(accountState?.connectedWalletInfo).toEqual(undefined)
    expect(accountState?.preferredAccountType).toEqual('smartAccount')
    expect(accountState?.status).toEqual('disconnected')
    expect(accountState?.socialProvider).toEqual(undefined)
    expect(accountState?.socialWindow).toEqual(undefined)
  })

  it('should reset account and set preferredAccountType from OptionsController.state.defaultAccountTypes if defined', () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
      ...OptionsController.state,
      defaultAccountTypes: {
        eip155: 'eoa'
      }
    })

    ChainController.resetAccount(chainNamespace)

    expect(
      ChainController.state.chains.get(chainNamespace)?.accountState?.preferredAccountType
    ).toEqual('eoa')
  })

  it('Expect modal to close after switching from unsupported network to supported network', async () => {
    // Mock ModalController.close
    const modalCloseSpy = vi.spyOn(ModalController, 'close')

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

    expect(modalCloseSpy).toHaveBeenCalled()

    modalCloseSpy.mockRestore()
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
})
