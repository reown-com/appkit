import { describe, expect, it, vi } from 'vitest'
import type { NetworkControllerClient } from '../../exports/index.js'
import type { CaipNetwork, CaipNetworkId } from '@reown/appkit-common'
import { ChainController, NetworkController } from '../../exports/index.js'
import { ConstantsUtil } from '@reown/appkit-common'

// -- Setup --------------------------------------------------------------------
const caipNetwork = {
  id: 1,
  caipNetworkId: 'eip155:1',
  name: 'Ethereum',
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  nativeCurrency: {
    name: 'Ethereum',
    decimals: 18,
    symbol: 'ETH'
  },
  rpcUrls: {
    default: {
      http: ['']
    }
  }
} as const

const solanaCaipNetwork = {
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  caipNetworkId: 'eip155:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  nativeCurrency: {
    name: 'Solana',
    decimals: 18,
    symbol: 'SOL'
  },
  rpcUrls: {
    default: {
      http: ['']
    }
  }
} as const
const requestedCaipNetworks = [
  {
    id: 1,
    caipNetworkId: 'eip155:1',
    name: 'Ethereum',
    chainNamespace: ConstantsUtil.CHAIN.EVM,
    nativeCurrency: {
      name: 'Ethereum',
      decimals: 18,
      symbol: 'ETH'
    },
    rpcUrls: {
      default: {
        http: ['']
      }
    }
  },
  {
    id: 42161,
    caipNetworkId: 'eip155:42161',
    name: 'Ethereum',
    chainNamespace: ConstantsUtil.CHAIN.EVM,
    nativeCurrency: {
      name: 'Ethereum',
      decimals: 18,
      symbol: 'ETH'
    },
    rpcUrls: {
      default: {
        http: ['']
      }
    }
  },
  {
    id: 43114,
    caipNetworkId: 'eip155:43114',
    name: 'Ethereum',
    chainNamespace: ConstantsUtil.CHAIN.EVM,
    nativeCurrency: {
      name: 'Ethereum',
      decimals: 18,
      symbol: 'ETH'
    },
    rpcUrls: {
      default: {
        http: ['']
      }
    }
  }
] as CaipNetwork[]
const approvedCaipNetworkIds = ['eip155:1', 'eip155:42161'] as CaipNetworkId[]

const chain = ConstantsUtil.CHAIN.EVM

const client: NetworkControllerClient = {
  switchCaipNetwork: async _caipNetwork => Promise.resolve(),
  getApprovedCaipNetworksData: async () =>
    Promise.resolve({ approvedCaipNetworkIds, supportsAllNetworks: false })
}

// -- Tests --------------------------------------------------------------------
describe('NetworkController', () => {
  it('should throw if client not set', () => {
    expect(NetworkController._getClient).toThrow(
      'Chain is required to get network controller client'
    )
    ChainController.initialize([
      {
        chainNamespace: ConstantsUtil.CHAIN.EVM,
        caipNetworks: []
      }
    ])
    expect(NetworkController._getClient).toThrow('NetworkController client not set')
  })

  it('should have valid default state', () => {
    ChainController.initialize([
      {
        chainNamespace: ConstantsUtil.CHAIN.EVM,
        networkControllerClient: client,
        caipNetworks: []
      }
    ])

    expect(NetworkController.state).toEqual({
      supportsAllNetworks: true,
      smartAccountEnabledNetworks: []
    })
  })

  it('should update state correctly on setRequestedCaipNetworks()', () => {
    NetworkController.setRequestedCaipNetworks(requestedCaipNetworks, chain)
    expect(NetworkController.state.requestedCaipNetworks).toEqual(requestedCaipNetworks)
  })

  it('should update state correctly on setCaipNetwork()', () => {
    NetworkController.setActiveCaipNetwork(caipNetwork)
    expect(ChainController.state.activeCaipNetwork).toEqual(caipNetwork)
  })

  it('should update state correctly on getApprovedCaipNetworkIds()', async () => {
    await NetworkController.setApprovedCaipNetworksData(chain)
    expect(NetworkController.state.approvedCaipNetworkIds).toEqual(approvedCaipNetworkIds)
  })

  it('should reset state correctly on resetNetwork()', () => {
    NetworkController.resetNetwork()
    expect(NetworkController.state.approvedCaipNetworkIds).toEqual(undefined)
    expect(NetworkController.state.requestedCaipNetworks).toEqual(requestedCaipNetworks)
    expect(NetworkController.state.smartAccountEnabledNetworks).toEqual([])
  })

  it('should check correctly if smart accounts are enabled on the network', () => {
    NetworkController.setActiveCaipNetwork(caipNetwork)
    NetworkController.setSmartAccountEnabledNetworks([1], chain)
    expect(NetworkController.checkIfSmartAccountEnabled()).toEqual(true)
    NetworkController.setSmartAccountEnabledNetworks([], chain)
    expect(NetworkController.checkIfSmartAccountEnabled()).toEqual(false)
    NetworkController.setSmartAccountEnabledNetworks([2], chain)
    expect(NetworkController.checkIfSmartAccountEnabled()).toEqual(false)
    NetworkController.setActiveCaipNetwork({
      id: 2,
      caipNetworkId: 'eip155:2',
      name: 'Ethereum',
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      nativeCurrency: {
        name: 'Ethereum',
        decimals: 18,
        symbol: 'ETH'
      },
      rpcUrls: {
        default: {
          http: ['']
        }
      }
    })
  })

  it('should check if network supports names feature', () => {
    NetworkController.resetNetwork()
    NetworkController.setActiveCaipNetwork(caipNetwork)
    expect(NetworkController.checkIfNamesSupported()).toEqual(true)
    NetworkController.setActiveCaipNetwork(solanaCaipNetwork)
    expect(NetworkController.checkIfNamesSupported()).toEqual(false)
  })

  it('should get correct active network token address', () => {
    let mock = vi
      .spyOn(ChainController.state, 'activeCaipNetwork', 'get')
      .mockReturnValue(undefined)
    expect(NetworkController.getActiveNetworkTokenAddress()).toEqual(
      'eip155:1:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    )

    mock.mockReturnValue(caipNetwork)
    expect(NetworkController.getActiveNetworkTokenAddress()).toEqual(
      'eip155:1:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    )

    mock.mockReturnValue(solanaCaipNetwork)
    expect(NetworkController.getActiveNetworkTokenAddress()).toEqual(
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:So11111111111111111111111111111111111111111'
    )

    mock.mockRestore()
  })
})
