import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Balance } from '@reown/appkit-common'
import {
  AccountController,
  ApiController,
  BlockchainApiController,
  ChainController,
  EnsController,
  RouterController,
  StorageUtil
} from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mockEvmAdapter, mockSolanaAdapter } from '../mocks/Adapter.js'
import { mainnet, polygon, sepolia, solana } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Utility Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider as any)
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockResolvedValue(['http://localhost:3000'])
  })

  it('should replace route', () => {
    const replace = vi.spyOn(RouterController, 'replace')

    const appKit = new AppKit(mockOptions)
    appKit.replace('Connect')

    expect(replace).toHaveBeenCalledWith('Connect')
  })

  it('should redirect to route', () => {
    const push = vi.spyOn(RouterController, 'push')

    const appKit = new AppKit(mockOptions)
    appKit.redirect('Networks')

    expect(push).toHaveBeenCalledWith('Networks')
  })

  it('should pop transaction stack', () => {
    const popTransactionStack = vi.spyOn(RouterController, 'popTransactionStack')

    const appKit = new AppKit(mockOptions)
    appKit.popTransactionStack('success')

    expect(popTransactionStack).toHaveBeenCalledWith('success')
  })

  it('should fetch identity', async () => {
    const mockRequest = {
      caipNetworkId: mainnet.caipNetworkId,
      address: '0x123'
    }
    const fetchIdentity = vi.spyOn(BlockchainApiController, 'fetchIdentity')
    fetchIdentity.mockResolvedValue({
      name: 'John Doe',
      avatar: null
    })

    const appKit = new AppKit(mockOptions)
    const result = await appKit.fetchIdentity(mockRequest)

    expect(fetchIdentity).toHaveBeenCalledWith(mockRequest)
    expect(result).toEqual({ name: 'John Doe', avatar: null })
  })

  it('should get Reown name', async () => {
    const getNamesForAddress = vi.spyOn(EnsController, 'getNamesForAddress')
    getNamesForAddress.mockResolvedValue([
      {
        name: 'john.reown.id',
        addresses: { eip155: { address: '0x123', created: '0' } },
        attributes: [],
        registered: 0,
        updated: 0
      }
    ])

    const appKit = new AppKit(mockOptions)
    const result = await appKit.getReownName('john.reown.id')

    expect(getNamesForAddress).toHaveBeenCalledWith('john.reown.id')
    expect(result).toEqual([
      {
        name: 'john.reown.id',
        addresses: { eip155: { address: '0x123', created: '0' } },
        attributes: [],
        registered: 0,
        updated: 0
      }
    ])
  })

  it('should use the correct network when syncing account if it does not allow all networks and network is not allowed', async () => {
    const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')
    const fetchTokenBalance = vi.spyOn(AccountController, 'fetchTokenBalance')
    const getActiveNetworkProps = vi.spyOn(StorageUtil, 'getActiveNetworkProps')
    const getNetworkProp = vi.spyOn(ChainController, 'getNetworkProp')

    const appKit = new AppKit(mockOptions)

    getActiveNetworkProps.mockReturnValue({
      namespace: mainnet.chainNamespace,
      chainId: mainnet.id,
      caipNetworkId: mainnet.caipNetworkId
    })

    fetchTokenBalance.mockResolvedValue([
      {
        quantity: { numeric: '0.00', decimals: '18' },
        chainId: mainnet.caipNetworkId,
        symbol: 'ETH'
      } as Balance
    ])

    const mockAccountData = {
      address: '0x123',
      chainId: polygon.id,
      chainNamespace: polygon.chainNamespace
    }

    await appKit['syncAccount'](mockAccountData)

    expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
    expect(getNetworkProp).toHaveBeenCalledWith('supportsAllNetworks', mainnet.chainNamespace)
  })

  it('should sync identity only if address changed', async () => {
    const fetchIdentity = vi.spyOn(BlockchainApiController, 'fetchIdentity')
    const mockAccountData = {
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    }

    const appKit = new AppKit(mockOptions)
    await appKit['syncAccount'](mockAccountData)

    expect(fetchIdentity).not.toHaveBeenCalled()

    await appKit['syncAccount']({ ...mockAccountData, address: '0x456' })

    expect(fetchIdentity).toHaveBeenCalledOnce()
  })

  it('should not sync identity on non-evm network', async () => {
    const fetchIdentity = vi.spyOn(BlockchainApiController, 'fetchIdentity')

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [mockSolanaAdapter],
      networks: [solana]
    })

    vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
      {
        quantity: { numeric: '0.00', decimals: '18' },
        chainId: solana.caipNetworkId,
        symbol: 'SOL'
      } as Balance
    ])
    const mockAccountData = {
      address: '7y523k4jsh90d',
      chainId: solana.id,
      chainNamespace: solana.chainNamespace
    }
    vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
      namespace: solana.chainNamespace,
      chainId: solana.id,
      caipNetworkId: solana.caipNetworkId
    })

    await appKit['syncAccount'](mockAccountData)

    expect(fetchIdentity).not.toHaveBeenCalled()
  })

  it('should not sync identity on a test network', async () => {
    const fetchIdentity = vi.spyOn(BlockchainApiController, 'fetchIdentity')

    const mockAdapter = {
      ...mockEvmAdapter,
      getBalance: vi.fn().mockResolvedValue({ balance: '1.00', symbol: 'sETH' })
    }
    const mockAccountData = {
      address: '0x123',
      chainId: sepolia.id,
      chainNamespace: sepolia.chainNamespace
    }

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [mockEvmAdapter],
      networks: [sepolia]
    })

    /**
     * Caution: Even though real getAdapter returning mocked adapter, it's not returning the getBalance as expected, it's returning undefined
     * So we need to mock the getBalance here specifically
     */
    vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce(mockAdapter)
    vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValueOnce([
      {
        quantity: { numeric: '0.00', decimals: '18' },
        chainId: sepolia.id,
        symbol: 'sETH'
      } as Balance
    ])
    vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
      namespace: sepolia.chainNamespace,
      chainId: sepolia.id,
      caipNetworkId: sepolia.caipNetworkId
    })

    await appKit['syncAccount'](mockAccountData)

    expect(fetchIdentity).not.toHaveBeenCalled()
  })
})
