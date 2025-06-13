import { PublicKey, Transaction } from '@solana/web3.js'
import type { WalletAccount } from '@wallet-standard/base'
import type { SessionTypes } from '@walletconnect/types'
import type UniversalProvider from '@walletconnect/universal-provider'
import bs58 from 'bs58'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createNamespaces } from '../src/WCNamespaceUtil.js'
import { SolConstantsUtil } from '../src/solana/SolanaConstantsUtil.js'
import { SolanaWalletConnectStandardWallet } from '../src/wallet-standard/SolanaWalletConnectStandardWallet.js'

const SOLANA_CHAINS = ['solana:mainnet', 'solana:devnet', 'solana:testnet', 'solana:localnet']

// Mock dependencies
vi.mock('@walletconnect/universal-provider')
vi.mock('@wallet-standard/wallet')

const mockAddress = 'HPAccp9wmUAP4kxATmf1CjARHfPzB1HXKWoEaNiZqvUQ'
const mockPublicKey = bs58.decode(mockAddress)

// Create a mock transaction bytes array
const mockTransactionBytes = Buffer.from([
  0x01, // version
  0x00, // header
  0x00,
  0x00,
  0x00,
  0x00, // recent blockhash
  0x00,
  0x00,
  0x00,
  0x00, // fee payer
  0x00,
  0x00,
  0x00,
  0x00, // instructions
  0x00,
  0x00,
  0x00,
  0x00 // signatures
])

describe('SolanaWalletConnectStandardWallet', () => {
  let mockProvider: Partial<UniversalProvider>
  let wallet: SolanaWalletConnectStandardWallet

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Setup mock provider
    mockProvider = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      request: vi.fn(),
      on: vi.fn(),
      session: vi.fn()
    } as unknown as Partial<UniversalProvider>

    // Create wallet instance using the static register method
    SolanaWalletConnectStandardWallet.register(mockProvider as UniversalProvider)
    wallet = new (SolanaWalletConnectStandardWallet as any)(mockProvider)
  })

  describe('constructor and initialization', () => {
    it('should initialize with correct properties', () => {
      expect(wallet.name).toBe('WalletConnect')
      expect(wallet.version).toBe('1.0.0')
      expect(wallet.chains).toEqual(SOLANA_CHAINS)
    })

    it('should set up event listeners on provider', () => {
      expect(mockProvider.on).toHaveBeenCalledWith('connect', expect.any(Function))
      expect(mockProvider.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(mockProvider.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function))
      expect(mockProvider.on).toHaveBeenCalledWith('chainChanged', expect.any(Function))
    })
  })

  describe('connect', () => {
    beforeEach(() => {
      vi.spyOn(mockProvider as UniversalProvider, 'connect').mockResolvedValue({
        namespaces: {
          solana: {
            accounts: [`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:${mockAddress}`],
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
            methods: [
              'solana:signAndSendTransaction',
              'solana:signTransaction',
              'solana:signMessage'
            ],
            events: ['change']
          }
        }
      } as unknown as SessionTypes.Struct)
    })

    it('should connect successfully', async () => {
      const connectResult = await wallet.features['standard:connect'].connect()
      expect(connectResult.accounts).toBeDefined()
      expect(mockProvider.connect).toHaveBeenCalledWith({
        namespaces: createNamespaces([SolConstantsUtil.DEFAULT_CHAIN])
      })
    })
  })

  describe('disconnect', () => {
    beforeEach(() => {
      vi.spyOn(mockProvider as UniversalProvider, 'session', 'get').mockReturnValue({
        namespaces: {
          solana: {
            accounts: [`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:${mockAddress}`],
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
            methods: [
              'solana:signAndSendTransaction',
              'solana:signTransaction',
              'solana:signMessage'
            ],
            events: ['change']
          }
        }
      } as unknown as SessionTypes.Struct)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should disconnect successfully', async () => {
      await wallet.features['standard:disconnect'].disconnect()
      expect(mockProvider.disconnect).toHaveBeenCalled()
    })
  })

  describe('signAndSendTransaction', () => {
    const mockAccount: WalletAccount = {
      address: mockAddress,
      publicKey: new PublicKey(mockPublicKey).toBytes(),
      chains: ['solana:mainnet'],
      features: ['solana:signAndSendTransaction']
    }

    beforeEach(async () => {
      vi.restoreAllMocks()
      vi.spyOn(mockProvider as UniversalProvider, 'session', 'get').mockReturnValue({
        namespaces: {
          solana: {
            accounts: [`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:${mockAddress}`],
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
            methods: ['solana:signAndSendTransaction'],
            events: ['change']
          }
        }
      } as unknown as SessionTypes.Struct)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should throw error when not connected', async () => {
      const mockTransactionBytes = new Uint8Array([1, 2, 3, 4, 5]) // Mock transaction bytes
      await expect(
        wallet.features['solana:signAndSendTransaction'].signAndSendTransaction({
          transaction: mockTransactionBytes,
          account: mockAccount,
          chain: 'solana:mainnet'
        })
      ).rejects.toThrow('not connected')
    })

    it('should sign and send transaction successfully', async () => {
      await wallet.features['standard:connect'].connect()
      const mockSignature = 'mockSignature'

      vi.spyOn(mockProvider as UniversalProvider, 'request').mockResolvedValueOnce({
        signature: mockSignature
      })

      const result = await wallet.features['solana:signAndSendTransaction'].signAndSendTransaction({
        transaction: mockTransactionBytes,
        account: mockAccount,
        chain: 'solana:mainnet'
      })

      expect(result?.[0]?.signature).toBeDefined()
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'solana_signAndSendTransaction',
        params: expect.any(Object)
      })
    })
  })

  describe('signTransaction', () => {
    const mockAccount: WalletAccount = {
      address: mockAddress,
      publicKey: new PublicKey(mockPublicKey).toBytes(),
      chains: ['solana:mainnet'],
      features: ['solana:signTransaction']
    }

    beforeEach(async () => {
      vi.restoreAllMocks()
      vi.spyOn(mockProvider as UniversalProvider, 'session', 'get').mockReturnValue({
        namespaces: {
          solana: {
            accounts: [`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:${mockAddress}`],
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
            methods: ['solana:signTransaction'],
            events: ['change']
          }
        }
      } as unknown as SessionTypes.Struct)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should throw error when not connected', async () => {
      await expect(
        wallet.features['solana:signTransaction'].signTransaction({
          transaction: mockTransactionBytes,
          account: mockAccount,
          chain: 'solana:mainnet'
        })
      ).rejects.toThrow('not connected')
    })

    it('should sign transaction successfully', async () => {
      vi.spyOn(Transaction, 'from').mockImplementation(buffer => {
        return {
          serialize: vi.fn().mockReturnValue(new Uint8Array(buffer)),
          recentBlockhash: 'mockBlockhash',
          feePayer: new PublicKey(mockPublicKey)
        } as unknown as Transaction
      })
      await wallet.features['standard:connect'].connect()
      const mockSignedTx = 'mockSignedTransaction'

      vi.spyOn(mockProvider as UniversalProvider, 'request').mockResolvedValueOnce({
        transaction: mockSignedTx
      })

      const result = await wallet.features['solana:signTransaction'].signTransaction({
        transaction: mockTransactionBytes,
        account: mockAccount,
        chain: 'solana:mainnet'
      })

      expect(result?.[0]?.signedTransaction).toBeDefined()
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'solana_signTransaction',
        params: expect.any(Object)
      })
    })
  })

  describe('signMessage', () => {
    const mockAccount: WalletAccount = {
      address: mockAddress,
      publicKey: new PublicKey(mockPublicKey).toBytes(),
      chains: ['solana:mainnet'],
      features: ['solana:signMessage']
    }

    beforeEach(() => {
      vi.restoreAllMocks()
      vi.spyOn(mockProvider as UniversalProvider, 'session', 'get').mockReturnValue({
        namespaces: {
          solana: {
            accounts: [`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:${mockAddress}`],
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
            methods: ['solana:signMessage'],
            events: ['change']
          }
        }
      } as unknown as SessionTypes.Struct)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should throw error when not connected', async () => {
      vi.spyOn(mockProvider as UniversalProvider, 'session', 'get').mockReturnValue(undefined)

      const mockMessage = new Uint8Array([1, 2, 3])
      await expect(
        wallet.features['solana:signMessage'].signMessage({
          message: mockMessage,
          account: mockAccount
        })
      ).rejects.toThrow('not connected')
    })

    it('should sign message successfully', async () => {
      await wallet.features['standard:connect'].connect()
      const mockMessage = new Uint8Array([1, 2, 3])
      const mockSignature = 'mockSignature'

      vi.spyOn(mockProvider as UniversalProvider, 'request').mockResolvedValueOnce({
        signature: mockSignature
      })

      const result = await wallet.features['solana:signMessage'].signMessage({
        message: mockMessage,
        account: mockAccount
      })

      expect(result?.[0]?.signature).toBeDefined()
      expect(result?.[0]?.signedMessage).toEqual(mockMessage)
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'solana_signMessage',
        params: expect.any(Object)
      })
    })
  })

  describe('events', () => {
    let connectHandler: (() => void) | undefined
    let disconnectHandler: (() => void) | undefined

    beforeEach(() => {
      vi.restoreAllMocks()
      vi.spyOn(mockProvider as UniversalProvider, 'session', 'get').mockReturnValue({
        namespaces: {
          solana: {
            accounts: [`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:${mockAddress}`],
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
            methods: [
              'solana:signAndSendTransaction',
              'solana:signTransaction',
              'solana:signMessage'
            ],
            events: ['change']
          }
        }
      } as unknown as SessionTypes.Struct)

      // Store event handlers when they're registered
      vi.spyOn(mockProvider as UniversalProvider, 'on').mockImplementation((event, handler) => {
        if (event === 'connect') {
          connectHandler = handler as () => void
        } else if (event === 'disconnect') {
          disconnectHandler = handler as () => void
        }
      })

      wallet.setProvider(mockProvider as UniversalProvider)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should handle connect event', () => {
      const mockListener = vi.fn()
      wallet.features['standard:events'].on('change', mockListener)

      // Call the connect handler directly
      if (connectHandler) {
        connectHandler()
      }

      expect(mockListener).toHaveBeenCalled()
    })

    it('should handle disconnect event', () => {
      const mockListener = vi.fn()
      wallet.features['standard:events'].on('change', mockListener)

      // Call the disconnect handler directly
      if (disconnectHandler) {
        disconnectHandler()
      }

      expect(mockListener).toHaveBeenCalled()
    })
  })
})
