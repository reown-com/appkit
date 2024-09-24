import { describe, expect, it, vi } from 'vitest'
import type { NetworkControllerClient } from '../../exports/index.js'
import type { CaipNetwork, CaipNetworkId } from '@reown/appkit-common'
import { ChainController, NetworkController } from '../../exports/index.js'
import { ConstantsUtil } from '@reown/appkit-common'

// -- Setup --------------------------------------------------------------------
const caipNetwork = {
  id: 'eip155:1',
  name: 'Ethereum',
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  chainId: 1,
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://rpc.infura.com/v1/'
} as const

const solanaCaipNetwork = {
  id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  chainNamespace: ConstantsUtil.CHAIN.SOLANA,
  chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  currency: 'SOL',
  explorerUrl: 'https://solscan.io',
  rpcUrl: 'https://rpc.infura.com/v1/'
} as const
const requestedCaipNetworks = [
  {
    id: 'eip155:1',
    name: 'Ethereum',
    chainNamespace: ConstantsUtil.CHAIN.EVM,
    chainId: 1,
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://rpc.infura.com/v1/'
  },
  {
    id: 'eip155:42161',
    name: 'Arbitrum One',
    chainNamespace: ConstantsUtil.CHAIN.EVM,
    chainId: 42161,
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://rpc.infura.com/v1/'
  },
  {
    id: 'eip155:43114',
    name: 'Avalanche C-Chain',
    chainNamespace: ConstantsUtil.CHAIN.EVM,
    chainId: 43114,
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://rpc.infura.com/v1/'
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
      id: 'eip155:2',
      name: 'Ethereum',
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      chainId: 2,
      currency: 'ETH',
      explorerUrl: 'https://etherscan.io',
      rpcUrl: 'https://rpc.infura.com/v1/'
    })
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

    mock.mockClear()
  })
})
