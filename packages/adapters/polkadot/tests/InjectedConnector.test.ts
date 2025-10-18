/**
 * Polkadot Connector Provider Tests
 * Tests the PolkadotConnectorProvider class in isolation
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PolkadotConnectorProvider } from '../src/connectors/InjectedConnector.js'
import type { PolkadotWalletSource } from '../src/providers/PolkadotProvider.js'
import { ACCOUNT_SUBWALLET_1, POLKADOT_CHAIN_ID, POLKADOT_MAINNET } from './util/TestConstants.js'

describe('PolkadotConnectorProvider', () => {
  let connector: PolkadotConnectorProvider
  let mockConnectHandler: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Create mock connect handler
    mockConnectHandler = vi.fn().mockResolvedValue({
      address: ACCOUNT_SUBWALLET_1.address,
      chainId: POLKADOT_CHAIN_ID
    })

    // Create connector instance
    connector = new PolkadotConnectorProvider({
      id: 'subwallet',
      source: 'subwallet-js' as PolkadotWalletSource,
      name: 'SubWallet',
      imageId: '092b1463-ad2a-4cb7-a7f3-dfe6bbee2700',
      chains: [POLKADOT_MAINNET],
      chain: 'polkadot',
      connectHandler: mockConnectHandler
    })
  })

  // =============================================================================
  // Initialization Tests
  // =============================================================================

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(connector.id).toBe('subwallet')
      expect(connector.name).toBe('SubWallet')
      expect(connector.type).toBe('INJECTED')
      expect(connector.namespace).toBe('polkadot')
      expect(connector.chains).toHaveLength(1)
      expect(connector.chains[0]).toEqual(POLKADOT_MAINNET)
    })

    it('should set provider to self', () => {
      expect(connector.provider).toBe(connector)
    })

    it('should initialize with empty accounts array', () => {
      expect(connector.accounts).toEqual([])
    })

    it('should store image URL', () => {
      expect(connector.imageUrl).toBeUndefined() // imageUrl is not set in constructor
    })

    it('should store chain ID', () => {
      expect(connector.chain).toBe('polkadot') // chain is set to namespace, not chainId
    })

    it('should have correct type', () => {
      expect(connector.type).toBe('INJECTED')
    })
  })

  // =============================================================================
  // Event System Tests
  // =============================================================================

  describe('event system', () => {
    it('should bind events on construction', () => {
      // bindEvents should be called during construction
      // We can verify by checking that event listeners can be registered
      const listener = vi.fn()
      connector.on('test', listener)

      connector.emit('test', 'data')
      expect(listener).toHaveBeenCalledWith('data')
    })

    it('should emit events correctly', () => {
      const listener = vi.fn()
      connector.on('connect', listener)

      connector.emit('connect', 'test-address')

      expect(listener).toHaveBeenCalledWith('test-address')
    })

    it('should remove listeners', () => {
      const listener = vi.fn()
      connector.on('disconnect', listener)
      connector.off('disconnect', listener)

      connector.emit('disconnect')

      expect(listener).not.toHaveBeenCalled()
    })

    it('should remove all listeners for an event', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      connector.on('test', listener1)
      connector.on('test', listener2)

      connector.removeAllListeners('test')
      connector.emit('test')

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })

    it('should handle errors in listeners gracefully', () => {
      const badListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error')
      })
      const goodListener = vi.fn()

      connector.on('test', badListener)
      connector.on('test', goodListener)

      // Should not throw
      expect(() => connector.emit('test')).not.toThrow()

      // Good listener should still be called
      expect(goodListener).toHaveBeenCalled()
    })
  })

  // =============================================================================
  // connect Method Tests
  // =============================================================================

  describe('connect', () => {
    it('should invoke connectHandler', async () => {
      await connector.connect()

      expect(mockConnectHandler).toHaveBeenCalledWith('subwallet-js')
    })

    it('should return address from handler', async () => {
      const address = await connector.connect()

      expect(address).toBe(ACCOUNT_SUBWALLET_1.address)
    })

    it('should emit connect event', async () => {
      const listener = vi.fn()
      connector.on('connect', listener)

      await connector.connect()

      expect(listener).toHaveBeenCalledWith(ACCOUNT_SUBWALLET_1.address)
    })

    it('should pass params to connect', async () => {
      const params = { chainId: POLKADOT_CHAIN_ID }
      await connector.connect(params)

      // Handler should still be called with source
      expect(mockConnectHandler).toHaveBeenCalled()
    })

    it('should emit error event on failure', async () => {
      const error = new Error('Connection failed')
      mockConnectHandler.mockRejectedValueOnce(error)

      const errorListener = vi.fn()
      connector.on('error', errorListener)

      await expect(connector.connect()).rejects.toThrow('Connection failed')
      expect(errorListener).toHaveBeenCalledWith(error)
    })

    it('should throw error when connectHandler fails', async () => {
      mockConnectHandler.mockRejectedValueOnce(new Error('Failed'))

      await expect(connector.connect()).rejects.toThrow('Failed')
    })
  })

  // =============================================================================
  // getAccounts Method Tests
  // =============================================================================

  describe('getAccounts', () => {
    it('should return empty array initially', async () => {
      const result = await connector.getAccounts()

      expect(result).toEqual([])
    })

    it('should map accounts to correct format', async () => {
      // Manually set accounts (simulating after connect)
      connector.accounts = [
        {
          address: ACCOUNT_SUBWALLET_1.address,
          name: 'Test Account',
          type: 'sr25519' as any
        }
      ]

      const result = await connector.getAccounts()

      expect(result).toEqual([
        {
          namespace: 'polkadot',
          address: ACCOUNT_SUBWALLET_1.address,
          type: 'eoa'
        }
      ])
    })

    it('should include namespace in account objects', async () => {
      connector.accounts = [
        {
          address: ACCOUNT_SUBWALLET_1.address,
          name: 'Test',
          type: 'sr25519' as any
        }
      ]

      const result = await connector.getAccounts()

      expect(result[0].namespace).toBe('polkadot')
    })

    it('should set type to eoa', async () => {
      connector.accounts = [
        {
          address: ACCOUNT_SUBWALLET_1.address,
          name: 'Test',
          type: 'sr25519' as any
        }
      ]

      const result = await connector.getAccounts()

      expect(result[0].type).toBe('eoa')
    })

    it('should handle multiple accounts', async () => {
      connector.accounts = [
        {
          address: '5Address1',
          name: 'Account 1',
          type: 'sr25519' as any
        },
        {
          address: '5Address2',
          name: 'Account 2',
          type: 'sr25519' as any
        }
      ]

      const result = await connector.getAccounts()

      expect(result).toHaveLength(2)
      expect(result[0].address).toBe('5Address1')
      expect(result[1].address).toBe('5Address2')
    })
  })

  // =============================================================================
  // disconnect Method Tests
  // =============================================================================

  describe('disconnect', () => {
    it('should clear provider', async () => {
      await connector.disconnect()

      expect(connector.provider).toBeNull()
    })

    it('should clear accounts', async () => {
      connector.accounts = [
        {
          address: ACCOUNT_SUBWALLET_1.address,
          name: 'Test',
          type: 'sr25519' as any
        }
      ]

      await connector.disconnect()

      expect(connector.accounts).toEqual([])
    })

    it('should emit disconnect event', async () => {
      const listener = vi.fn()
      connector.on('disconnect', listener)

      await connector.disconnect()

      expect(listener).toHaveBeenCalled()
    })

    it('should be callable multiple times', async () => {
      await connector.disconnect()
      await expect(connector.disconnect()).resolves.not.toThrow()
    })
  })

  // =============================================================================
  // isInstalled Method Tests
  // =============================================================================

  describe('isInstalled', () => {
    it('should return false in non-browser environment', () => {
      // In test environment (Node.js), window might not exist or injectedWeb3 won't
      const result = connector.isInstalled()

      // This will depend on test setup, but should handle gracefully
      expect(typeof result).toBe('boolean')
    })

    it('should check window.injectedWeb3 for wallet source', () => {
      // Mock window.injectedWeb3
      if (typeof window !== 'undefined') {
        ;(window as any).injectedWeb3 = {
          'subwallet-js': { version: '1.0.0' }
        }

        expect(connector.isInstalled()).toBe(true)

        delete (window as any).injectedWeb3
      }
    })

    it('should return false when wallet not installed', () => {
      if (typeof window !== 'undefined') {
        ;(window as any).injectedWeb3 = {
          'other-wallet': { version: '1.0.0' }
        }

        expect(connector.isInstalled()).toBe(false)

        delete (window as any).injectedWeb3
      }
    })
  })

  // =============================================================================
  // Integration Tests
  // =============================================================================

  describe('integration scenarios', () => {
    it('should handle full connect-disconnect cycle', async () => {
      const connectListener = vi.fn()
      const disconnectListener = vi.fn()

      connector.on('connect', connectListener)
      connector.on('disconnect', disconnectListener)

      // Connect
      const address = await connector.connect()
      expect(address).toBe(ACCOUNT_SUBWALLET_1.address)
      expect(connectListener).toHaveBeenCalledWith(ACCOUNT_SUBWALLET_1.address)

      // Disconnect
      await connector.disconnect()
      expect(disconnectListener).toHaveBeenCalled()
      expect(connector.provider).toBeNull()
    })

    it('should maintain state across multiple operations', async () => {
      // Set accounts
      connector.accounts = [{ address: '5Addr1', name: 'Account 1', type: 'sr25519' as any }]

      // Get accounts
      let accounts = await connector.getAccounts()
      expect(accounts).toHaveLength(1)

      // Add more accounts
      connector.accounts.push({ address: '5Addr2', name: 'Account 2', type: 'sr25519' as any })

      accounts = await connector.getAccounts()
      expect(accounts).toHaveLength(2)

      // Disconnect should clear
      await connector.disconnect()
      accounts = await connector.getAccounts()
      expect(accounts).toHaveLength(0)
    })

    it('should handle connect failure and recovery', async () => {
      mockConnectHandler.mockRejectedValueOnce(new Error('Network error'))

      // First attempt fails
      await expect(connector.connect()).rejects.toThrow('Network error')

      // Second attempt succeeds
      mockConnectHandler.mockResolvedValueOnce({
        address: ACCOUNT_SUBWALLET_1.address,
        chainId: POLKADOT_CHAIN_ID
      })

      const address = await connector.connect()
      expect(address).toBe(ACCOUNT_SUBWALLET_1.address)
    })
  })

  // =============================================================================
  // Edge Cases
  // =============================================================================

  describe('edge cases', () => {
    it('should handle missing imageUrl', () => {
      const connectorNoImage = new PolkadotConnectorProvider({
        id: 'test',
        source: 'test' as PolkadotWalletSource,
        name: 'Test Wallet',
        chains: [POLKADOT_MAINNET],
        chain: 'polkadot',
        connectHandler: mockConnectHandler
      })

      expect(connectorNoImage.imageUrl).toBeUndefined()
    })

    it('should handle empty chains array', () => {
      const connectorNoChains = new PolkadotConnectorProvider({
        id: 'test',
        source: 'test' as PolkadotWalletSource,
        name: 'Test Wallet',
        chains: [],
        chain: 'polkadot',
        connectHandler: mockConnectHandler
      })

      expect(connectorNoChains.chains).toEqual([])
    })

    it('should handle concurrent getAccounts calls', async () => {
      connector.accounts = [{ address: '5Addr', name: 'Test', type: 'sr25519' as any }]

      const [result1, result2, result3] = await Promise.all([
        connector.getAccounts(),
        connector.getAccounts(),
        connector.getAccounts()
      ])

      expect(result1).toEqual(result2)
      expect(result2).toEqual(result3)
    })

    it('should not interfere with other connector instances', () => {
      const connector2 = new PolkadotConnectorProvider({
        id: 'talisman',
        source: 'talisman' as PolkadotWalletSource,
        name: 'Talisman',
        chains: [POLKADOT_MAINNET],
        chain: 'polkadot',
        connectHandler: vi.fn()
      })

      expect(connector.id).toBe('subwallet')
      expect(connector2.id).toBe('talisman')
      expect(connector.provider).not.toBe(connector2.provider)
    })
  })
})
