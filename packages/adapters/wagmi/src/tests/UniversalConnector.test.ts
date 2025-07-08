import { getAddress } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ChainController } from '@reown/appkit-controllers'
import { mainnet } from '@reown/appkit/networks'

import { walletConnect } from '../connectors/UniversalConnector'
import {
  mockAddress,
  mockAppKit,
  mockCaipAddress,
  mockCaipNetworks,
  mockExtendedCaipNetworks,
  mockProvider,
  mockSession
} from './mocks/AppKit'

vi.mock('@reown/appkit-controllers', async importOriginal => {
  const actual = await importOriginal<typeof import('@reown/appkit-controllers')>()
  return {
    ...actual,
    StorageUtil: {
      getActiveNamespace: vi.fn(),
      getStoredActiveCaipNetworkId: vi.fn()
    }
  }
})

const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
}

const mockEmitter = {
  emit: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn()
}

describe('UniversalConnector', () => {
  let connectorInstance: any

  beforeEach(() => {
    const createConnector = walletConnect(
      {
        isNewChainsStale: false
      } as any,
      mockAppKit
    )

    connectorInstance = createConnector({
      chains: mockCaipNetworks,
      options: {},
      // @ts-expect-error - mocking Wagmi's storage
      storage: mockStorage,
      // @ts-expect-error - mocking Wagmi's emitter
      emitter: mockEmitter
    })
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue(mockExtendedCaipNetworks)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('connect', () => {
    it('should connect successfully', async () => {
      const expectedChainId = mainnet.id

      const result = await connectorInstance.connect()

      expect(result).toEqual({
        accounts: [getAddress(mockAddress)],
        chainId: expectedChainId
      })
      expect(mockProvider.on).toHaveBeenCalled()
      expect(mockProvider.session.namespaces.eip155.accounts).toEqual([mockCaipAddress])
      expect(mockProvider.setDefaultChain).toHaveBeenCalledWith(`eip155:${expectedChainId}`)
    })
  })

  describe('getAccounts', () => {
    it('should return accounts from provider session', async () => {
      await connectorInstance.connect()
      const accounts = await connectorInstance.getAccounts()

      expect(accounts).toEqual([mockAddress])
    })

    it('should return empty array when no session exists', async () => {
      // @ts-expect-error - override mockProvider only for session to test getAccounts
      mockProvider.session = undefined
      const accounts = await connectorInstance.getAccounts()

      expect(accounts).toEqual([])
    })
  })

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      mockProvider.session = mockSession

      await connectorInstance.connect()
      await connectorInstance.disconnect()

      expect(mockProvider.disconnect).toHaveBeenCalled()
      expect(mockProvider.removeListener).toHaveBeenCalled()
    })
  })

  describe('switchChain', () => {
    it('should switch chain successfully', async () => {
      mockProvider.request.mockResolvedValue(null)

      const result = await connectorInstance.switchChain({ chainId: 1 })

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Ethereum'
        })
      )
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }]
      })
    })

    it('should handle adding a new chain', async () => {
      // First request fails, triggering add chain flow
      mockProvider.request.mockRejectedValueOnce(new Error('chain not found'))
      mockProvider.request.mockResolvedValueOnce(null)

      const result = await connectorInstance.switchChain({ chainId: 1 })

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Ethereum'
        })
      )
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_addEthereumChain',
        params: [
          expect.objectContaining({
            chainId: '0x1',
            chainName: 'Ethereum'
          })
        ]
      })
    })
  })

  describe.skip('isAuthorized', () => {
    it('should return true when authorized', async () => {
      const result = await connectorInstance.isAuthorized()
      expect(result).toBe(true)
    })

    it('should return false when no accounts exist', async () => {
      mockProvider.session.namespaces.eip155.accounts = []
      const result = await connectorInstance.isAuthorized()
      expect(result).toBe(false)
    })
  })
})
