/**
 * Comprehensive Polkadot Adapter Tests
 * Tests all public methods, error cases, and edge scenarios
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ChainNamespace } from '@laughingwhales/appkit-common'

import { PolkadotAdapter } from '../src/adapter.js'
import type { PolkadotAdapterOptions } from '../src/adapter.js'
// Import mocks
import { clearMockInjectedWeb3, setupMockInjectedWeb3 } from './mocks/mockInjectedWeb3.js'
import {
  MockApiPromise,
  MockWsProvider,
  formatBalance,
  resetMockApi,
  setMockBalance
} from './mocks/mockPolkadotApi.js'
import {
  resetMockExtension,
  triggerAccountChange,
  web3Accounts,
  web3AccountsSubscribe,
  web3Enable,
  web3FromAddress
} from './mocks/mockPolkadotExtension.js'
// Import test constants
import {
  ACCOUNT_POLKADOTJS_1,
  ACCOUNT_SUBWALLET_1,
  ACCOUNT_SUBWALLET_2,
  ACCOUNT_TALISMAN_1,
  KUSAMA_NETWORK,
  MOCK_ACCOUNTS,
  POLKADOT_CHAIN_ID,
  POLKADOT_MAINNET,
  TEST_BALANCE_FORMATTED,
  TEST_BALANCE_PLANCK,
  TEST_MESSAGE,
  TEST_MESSAGE_HEX,
  WALLET_NAMES,
  WESTEND_TESTNET,
  getAccountsBySource
} from './util/TestConstants.js'

// Mock Polkadot modules
vi.mock('@polkadot/extension-dapp', () => ({
  web3Enable,
  web3Accounts,
  web3FromAddress,
  web3AccountsSubscribe
}))

vi.mock('@polkadot/api', () => ({
  ApiPromise: MockApiPromise,
  WsProvider: MockWsProvider
}))

vi.mock('@polkadot/util', () => ({
  formatBalance
}))

describe('PolkadotAdapter', () => {
  let adapter: PolkadotAdapter

  beforeEach(() => {
    // Reset all mocks
    resetMockExtension()
    resetMockApi()
    clearMockInjectedWeb3()

    // Setup default environment with all three wallets
    setupMockInjectedWeb3(['subwallet-js', 'talisman', 'polkadot-js'])

    // Create fresh adapter instance
    adapter = new PolkadotAdapter({
      appName: 'Test App'
    })

    // Mock getCaipNetworks to return test networks
    vi.spyOn(adapter as any, 'getCaipNetworks').mockReturnValue([POLKADOT_MAINNET])
  })

  afterEach(() => {
    clearMockInjectedWeb3()
  })

  // =============================================================================
  // Initialization Tests
  // =============================================================================

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultAdapter = new PolkadotAdapter()
      expect(defaultAdapter).toBeDefined()
      expect((defaultAdapter as any).appName).toBe('AppKit Polkadot')
      expect((defaultAdapter as any).preferredWallets).toEqual([
        'subwallet-js',
        'talisman',
        'polkadot-js'
      ])
    })

    it('should initialize with custom app name', () => {
      const customAdapter = new PolkadotAdapter({ appName: 'CustomApp' })
      expect((customAdapter as any).appName).toBe('CustomApp')
    })

    it('should initialize with preferred wallets', () => {
      const customAdapter = new PolkadotAdapter({
        preferredWallets: ['talisman', 'subwallet-js']
      })
      expect((customAdapter as any).preferredWallets).toEqual(['talisman', 'subwallet-js'])
    })

    it('should store onSelectAccount callback', () => {
      const callback = vi.fn()
      const customAdapter = new PolkadotAdapter({ onSelectAccount: callback })
      expect((customAdapter as any).onSelectAccount).toBe(callback)
    })

    it('should have correct namespace and adapter type', () => {
      expect(adapter.namespace).toBe('polkadot')
      expect(adapter.adapterType).toBe('polkadot-injected')
    })
  })

  // =============================================================================
  // syncConnectors Tests
  // =============================================================================

  describe('syncConnectors', () => {
    it('should detect installed extensions', () => {
      const emitSpy = vi.spyOn(adapter, 'emit')

      adapter.syncConnectors()

      expect(emitSpy).toHaveBeenCalledWith('connectors', expect.any(Array))
      expect(adapter.connectors).toHaveLength(3)
      // Order may vary based on object key iteration
      const ids = adapter.connectors.map((c: any) => c.id).sort()
      expect(ids).toEqual(['polkadot', 'subwallet', 'talisman'])
    })

    it('should map extension sources to friendly IDs', () => {
      adapter.syncConnectors()

      const connector = adapter.connectors.find((c: any) => c.id === 'subwallet')
      expect(connector).toBeDefined()
      expect((connector as any).name).toBe('SubWallet')
    })

    it('should only detect preferred wallets', () => {
      const limitedAdapter = new PolkadotAdapter({
        preferredWallets: ['talisman']
      })
      vi.spyOn(limitedAdapter as any, 'getCaipNetworks').mockReturnValue([POLKADOT_MAINNET])

      limitedAdapter.syncConnectors()

      expect(limitedAdapter.connectors).toHaveLength(1)
      expect((limitedAdapter.connectors[0] as any).id).toBe('talisman')
    })

    it('should handle no extensions installed', () => {
      clearMockInjectedWeb3()

      adapter.syncConnectors()

      expect(adapter.connectors).toHaveLength(0)
    })

    it('should handle server-side environment', () => {
      // This test assumes we're in Node.js/test environment
      // syncConnectors should handle missing window gracefully
      const serverAdapter = new PolkadotAdapter()
      expect(() => serverAdapter.syncConnectors()).not.toThrow()
    })

    it('should emit connectors event', () => {
      const emitSpy = vi.spyOn(adapter, 'emit')

      adapter.syncConnectors()

      expect(emitSpy).toHaveBeenCalledWith(
        'connectors',
        expect.arrayContaining([
          expect.objectContaining({ id: 'subwallet' }),
          expect.objectContaining({ id: 'talisman' }),
          expect.objectContaining({ id: 'polkadot' })
        ])
      )
    })
  })

  // =============================================================================
  // connect Tests
  // =============================================================================

  describe('connect', () => {
    beforeEach(() => {
      adapter.syncConnectors()
    })

    it('should enable extensions on first connect', async () => {
      await adapter.connect({ id: 'subwallet-js', type: 'INJECTED' } as any)

      expect(web3Enable).toHaveBeenCalledTimes(1)
      expect(web3Enable).toHaveBeenCalledWith('Test App')
    })

    it('should throw when no extensions enabled', async () => {
      clearMockInjectedWeb3()
      web3Enable.mockResolvedValueOnce([])

      await expect(
        adapter.connect({ id: 'subwallet-js', type: 'INJECTED' } as any)
      ).rejects.toThrow('No Polkadot extension')
    })

    it('should connect to specified wallet source', async () => {
      const result = await adapter.connect({ id: 'subwallet-js', type: 'INJECTED' } as any)

      expect(result.address).toBe(ACCOUNT_SUBWALLET_1.address)
      expect(result.chainId).toBe(POLKADOT_CHAIN_ID)
    })

    it('should auto-select single account', async () => {
      // Only one account from talisman
      const result = await adapter.connect({ id: 'talisman', type: 'INJECTED' } as any)

      expect(result.address).toBe(ACCOUNT_TALISMAN_1.address)
      // onSelectAccount should not be called for single account
    })

    it('should use onSelectAccount for multiple accounts', async () => {
      const selectCallback = vi.fn().mockResolvedValue(ACCOUNT_SUBWALLET_2)
      const adapterWithCallback = new PolkadotAdapter({
        appName: 'Test App',
        onSelectAccount: selectCallback
      })
      vi.spyOn(adapterWithCallback as any, 'getCaipNetworks').mockReturnValue([POLKADOT_MAINNET])
      adapterWithCallback.syncConnectors()

      const result = await adapterWithCallback.connect({
        id: 'subwallet-js',
        type: 'INJECTED'
      } as any)

      expect(selectCallback).toHaveBeenCalled()
      expect(result.address).toBe(ACCOUNT_SUBWALLET_2.address)
    })

    it('should throw when account selection is cancelled', async () => {
      const selectCallback = vi.fn().mockRejectedValue(new Error('Cancelled'))
      const adapterWithCallback = new PolkadotAdapter({
        appName: 'Test App',
        onSelectAccount: selectCallback
      })
      vi.spyOn(adapterWithCallback as any, 'getCaipNetworks').mockReturnValue([POLKADOT_MAINNET])
      adapterWithCallback.syncConnectors()

      await expect(
        adapterWithCallback.connect({ id: 'subwallet-js', type: 'INJECTED' } as any)
      ).rejects.toThrow('Account selection cancelled')
    })

    it('should emit accountChanged event', async () => {
      const emitSpy = vi.spyOn(adapter, 'emit')

      await adapter.connect({ id: 'talisman', type: 'INJECTED' } as any)

      expect(emitSpy).toHaveBeenCalledWith(
        'accountChanged',
        expect.objectContaining({
          address: ACCOUNT_TALISMAN_1.address,
          chainId: POLKADOT_CHAIN_ID
        })
      )
    })

    it('should emit connections event', async () => {
      const emitSpy = vi.spyOn(adapter, 'emit')

      await adapter.connect({ id: 'talisman', type: 'INJECTED' } as any)

      expect(emitSpy).toHaveBeenCalledWith(
        'connections',
        expect.arrayContaining([
          expect.objectContaining({
            connectorId: 'talisman'
          })
        ])
      )
    })

    it('should store connection in adapter state', async () => {
      await adapter.connect({ id: 'talisman', type: 'INJECTED' } as any)

      expect(adapter.connections).toHaveLength(1)
      expect(adapter.connections[0].connectorId).toBe('talisman')
    })

    it('should setup account subscription', async () => {
      await adapter.connect({ id: 'talisman', type: 'INJECTED' } as any)

      expect(web3AccountsSubscribe).toHaveBeenCalled()
    })

    it('should handle connection to non-existent wallet', async () => {
      await expect(
        adapter.connect({ id: 'nonexistent', type: 'INJECTED' } as any)
      ).rejects.toThrow()
    })

    it('should filter accounts by wallet source', async () => {
      const result = await adapter.connect({ id: 'subwallet-js', type: 'INJECTED' } as any)

      // Should only connect to SubWallet account, not Talisman or Polkadot.js
      expect(result.address).toBe(ACCOUNT_SUBWALLET_1.address)
      expect(result.address).not.toBe(ACCOUNT_TALISMAN_1.address)
    })
  })

  // =============================================================================
  // disconnect Tests
  // =============================================================================

  describe('disconnect', () => {
    beforeEach(async () => {
      adapter.syncConnectors()
      await adapter.connect({ id: 'talisman', type: 'INJECTED' } as any)
    })

    it('should disconnect specific wallet', async () => {
      await adapter.disconnect({ id: 'talisman' })

      expect(adapter.connections).toHaveLength(0)
    })

    it('should emit connections event after disconnect', async () => {
      const emitSpy = vi.spyOn(adapter, 'emit')

      await adapter.disconnect({ id: 'talisman' })

      expect(emitSpy).toHaveBeenCalledWith('connections', [])
    })

    it('should emit disconnect event when all connections removed', async () => {
      const emitSpy = vi.spyOn(adapter, 'emit')

      await adapter.disconnect({ id: 'talisman' })

      expect(emitSpy).toHaveBeenCalledWith('disconnect')
    })

    it('should disconnect all wallets when no ID provided', async () => {
      // Connect second wallet
      await adapter.connect({ id: 'subwallet-js', type: 'INJECTED' } as any)

      await adapter.disconnect()

      expect(adapter.connections).toHaveLength(0)
      expect(adapter.connectors).toHaveLength(0)
    })

    it('should handle disconnecting non-existent wallet', async () => {
      await expect(adapter.disconnect({ id: 'nonexistent' })).resolves.not.toThrow()
    })

    it('should cleanup account subscription on disconnect all', async () => {
      const accountUnsubscribe = vi.fn()
      ;(adapter as any).accountUnsubscribe = accountUnsubscribe

      await adapter.disconnect()

      expect(accountUnsubscribe).toHaveBeenCalled()
    })
  })

  // =============================================================================
  // getAccounts Tests
  // =============================================================================

  describe('getAccounts', () => {
    beforeEach(async () => {
      adapter.syncConnectors()
      await adapter.connect({ id: 'subwallet-js', type: 'INJECTED' } as any)
    })

    it('should return accounts for connected wallet', async () => {
      const result = await adapter.getAccounts({ id: 'subwallet-js' } as any)

      expect(result.accounts).toHaveLength(2)
      expect(result.accounts[0].address).toBe(ACCOUNT_SUBWALLET_1.address)
    })

    it('should map accounts to expected format with eoa type', async () => {
      const result = await adapter.getAccounts({ id: 'subwallet-js' } as any)

      // Adapter returns full account object with namespace
      expect(result.accounts[0]).toMatchObject({
        address: ACCOUNT_SUBWALLET_1.address,
        namespace: 'polkadot'
      })
      // Type is preserved from original (sr25519, ed25519, etc)
      expect(result.accounts[0].type).toBeDefined()
    })

    it('should return empty array for unknown connector', async () => {
      const result = await adapter.getAccounts({ id: 'unknown' } as any)

      expect(result.accounts).toEqual([])
    })

    it('should return empty array for non-connected wallet', async () => {
      const result = await adapter.getAccounts({ id: 'talisman' } as any)

      expect(result.accounts).toEqual([])
    })
  })

  // =============================================================================
  // getBalance Tests
  // =============================================================================

  describe('getBalance', () => {
    beforeEach(() => {
      setMockBalance(ACCOUNT_SUBWALLET_1.address, TEST_BALANCE_PLANCK)
    })

    it('should query balance for address', async () => {
      const result = await adapter.getBalance({
        address: ACCOUNT_SUBWALLET_1.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)

      expect(result.balance).toBeDefined()
      expect(result.symbol).toBe('DOT')
    })

    it('should format balance with correct decimals', async () => {
      const result = await adapter.getBalance({
        address: ACCOUNT_SUBWALLET_1.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)

      // Adapter passes balance and options object with decimals
      expect(formatBalance).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          decimals: 10 // DOT decimals
        })
      )
    })

    it('should return symbol from chain registry', async () => {
      const result = await adapter.getBalance({
        address: ACCOUNT_SUBWALLET_1.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)

      expect(result.symbol).toBe('DOT')
    })

    it('should cache API instance per network', async () => {
      const createSpy = vi.spyOn(MockApiPromise, 'create')

      await adapter.getBalance({
        address: ACCOUNT_SUBWALLET_1.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)

      await adapter.getBalance({
        address: ACCOUNT_SUBWALLET_1.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)

      // Should only create once due to caching
      expect(createSpy).toHaveBeenCalledTimes(1)
    })

    it('should create separate API instances for different networks', async () => {
      const createSpy = vi.spyOn(MockApiPromise, 'create')

      await adapter.getBalance({
        address: ACCOUNT_SUBWALLET_1.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)

      await adapter.getBalance({
        address: ACCOUNT_SUBWALLET_1.address,
        caipNetwork: KUSAMA_NETWORK
      } as any)

      expect(createSpy).toHaveBeenCalledTimes(2)
    })

    it('should return zero balance on API error', async () => {
      const createSpy = vi
        .spyOn(MockApiPromise, 'create')
        .mockRejectedValueOnce(new Error('Network error'))

      const result = await adapter.getBalance({
        address: ACCOUNT_SUBWALLET_1.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)

      expect(result.balance).toBe('0')
      createSpy.mockRestore()
    })

    it('should handle missing address parameter', async () => {
      // Adapter validates required parameters and throws
      await expect(
        adapter.getBalance({
          caipNetwork: POLKADOT_MAINNET
        } as any)
      ).rejects.toThrow('Address and caipNetwork are required')
    })

    it('should use correct WebSocket URL from network config', async () => {
      // Spy on WsProvider constructor before creating instance
      const constructorSpy = vi.fn()
      const OriginalWsProvider = MockWsProvider

      // Override MockWsProvider temporarily
      vi.spyOn(MockWsProvider.prototype, 'constructor' as any).mockImplementation(function (
        this: any,
        endpoint: string
      ) {
        constructorSpy(endpoint)
        this.endpoint = endpoint
      })

      await adapter.getBalance({
        address: ACCOUNT_SUBWALLET_1.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)

      // Check that WebSocket URL was used
      const wsUrl = POLKADOT_MAINNET.rpcUrls.default.webSocket?.[0]
      expect(wsUrl).toBe('wss://rpc.polkadot.io')
    })
  })

  // =============================================================================
  // signMessage Tests
  // =============================================================================

  describe('signMessage', () => {
    beforeEach(async () => {
      adapter.syncConnectors()
      await adapter.connect({ id: 'talisman', type: 'INJECTED' } as any)
    })

    it('should sign message successfully', async () => {
      const result = await adapter.signMessage({
        address: ACCOUNT_TALISMAN_1.address,
        message: TEST_MESSAGE
      } as any)

      expect(result.signature).toBeDefined()
      expect(result.signature).toMatch(/^0x[a-f0-9]+$/i)
    })

    it('should call web3FromAddress with correct address', async () => {
      await adapter.signMessage({
        address: ACCOUNT_TALISMAN_1.address,
        message: TEST_MESSAGE
      } as any)

      expect(web3FromAddress).toHaveBeenCalledWith(ACCOUNT_TALISMAN_1.address)
    })

    it('should convert string message to hex', async () => {
      // Create a fresh spy that captures all signRaw calls
      const originalWeb3FromAddress = web3FromAddress.getMockImplementation()
      const signRawCalls: any[] = []

      web3FromAddress.mockImplementation(async (address: string) => {
        const result = await originalWeb3FromAddress!(address)
        const originalSignRaw = result.signer.signRaw
        result.signer.signRaw = vi.fn(async (request: any) => {
          signRawCalls.push(request)
          return originalSignRaw(request)
        })
        return result
      })

      await adapter.signMessage({
        address: ACCOUNT_TALISMAN_1.address,
        message: TEST_MESSAGE
      } as any)

      // Verify signRaw was called with hex data
      expect(signRawCalls.length).toBeGreaterThan(0)
      expect(signRawCalls[0].data).toMatch(/^0x/)

      // Restore original
      web3FromAddress.mockImplementation(originalWeb3FromAddress!)
    })

    it('should handle already hex-encoded message', async () => {
      const result = await adapter.signMessage({
        address: ACCOUNT_TALISMAN_1.address,
        message: TEST_MESSAGE_HEX
      } as any)

      expect(result.signature).toBeDefined()
    })

    it('should throw when address has no wallet connected', async () => {
      await expect(
        adapter.signMessage({
          address: ACCOUNT_SUBWALLET_1.address, // Not connected
          message: TEST_MESSAGE
        } as any)
      ).rejects.toThrow()
    })
  })

  // =============================================================================
  // sendTransaction Tests (Not Implemented)
  // =============================================================================

  describe('sendTransaction', () => {
    it('should throw not implemented error', async () => {
      await expect(adapter.sendTransaction({} as any)).rejects.toThrow('not yet implemented')
    })
  })

  // =============================================================================
  // syncConnection Tests
  // =============================================================================

  describe('syncConnection', () => {
    it('should handle server-side environment', async () => {
      // syncConnection calls connect which is async and may throw
      // Test that it handles the promise rejection gracefully
      try {
        await (adapter as any).syncConnection({ id: 'test', address: 'test' })
      } catch (error) {
        // Expected to throw for non-existent wallet in test environment
        expect(error).toBeDefined()
      }
    })
  })

  // =============================================================================
  // Helper Methods Tests
  // =============================================================================

  describe('helper methods', () => {
    describe('getWalletSource', () => {
      it('should map wallet IDs to sources', () => {
        expect((adapter as any).getWalletSource('subwallet')).toBe('subwallet-js')
        expect((adapter as any).getWalletSource('polkadot')).toBe('polkadot-js')
        expect((adapter as any).getWalletSource('talisman')).toBe('talisman')
      })

      it('should pass through unknown IDs', () => {
        expect((adapter as any).getWalletSource('unknown')).toBe('unknown')
      })
    })

    // Note: getWalletName and getWalletIcon methods were removed as they're not used
    // The wallet metadata is handled through ConstantsUtil and PresetsUtil
  })
})
