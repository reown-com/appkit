import { Psbt } from 'bitcoinjs-lib'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { bitcoin, bitcoinTestnet, mainnet } from '@reown/appkit/networks'

import { WalletStandardConnector } from '../../src/connectors/WalletStandardConnector'
import { MethodNotSupportedError } from '../../src/errors/MethodNotSupportedError'
import { mockWalletStandardProvider } from '../mocks/mockWalletStandard'

/**
 * Creates a mock signed PSBT with a partial signature at the specified input index.
 */
function createMockSignedPsbt(inputIndex: number = 0): Uint8Array {
  const psbt = new Psbt()

  // Add a minimal transaction structure
  psbt.addInput({
    hash: Buffer.alloc(32, 0),
    index: 0,
    witnessUtxo: {
      script: Buffer.from('0014' + '00'.repeat(20), 'hex'),
      value: 10000
    }
  })
  psbt.addOutput({
    script: Buffer.from('0014' + '00'.repeat(20), 'hex'),
    value: 9000
  })

  // Add a partial signature to simulate a signed input
  // This is a mock signature - 33 byte compressed pubkey + 71 byte DER signature
  const mockPubKey = Buffer.alloc(33, 0x02)
  mockPubKey[32] = 0x01 // Make it a valid compressed pubkey format
  const mockSignature = Buffer.alloc(71, 0x30)

  psbt.data.inputs[inputIndex]!.partialSig = [
    {
      pubkey: mockPubKey,
      signature: mockSignature
    }
  ]

  return psbt.toBuffer()
}

/**
 * Creates a mock unsigned PSBT (no signatures).
 */
function createMockUnsignedPsbt(): Uint8Array {
  const psbt = new Psbt()

  psbt.addInput({
    hash: Buffer.alloc(32, 0),
    index: 0,
    witnessUtxo: {
      script: Buffer.from('0014' + '00'.repeat(20), 'hex'),
      value: 10000
    }
  })
  psbt.addOutput({
    script: Buffer.from('0014' + '00'.repeat(20), 'hex'),
    value: 9000
  })

  return psbt.toBuffer()
}

vi.mock('@wallet-standard/app', async () =>
  Promise.resolve({
    getWallets: () => ({
      get: () => [mockWalletStandardProvider()],
      on: () => {}
    })
  })
)

describe('WalletStandardConnector', () => {
  let connector: WalletStandardConnector
  let wallet: ReturnType<typeof mockWalletStandardProvider>
  let requestedChains: CaipNetwork[]

  beforeEach(() => {
    // requested chains may contain not bip122 chains
    requestedChains = [
      { ...mainnet, caipNetworkId: 'eip155:1', chainNamespace: 'eip155' },
      bitcoin,
      bitcoinTestnet
    ]
    wallet = mockWalletStandardProvider()
    connector = new WalletStandardConnector({
      wallet,
      requestedChains
    })
  })

  it('should validate the test fixture', async () => {
    expect(connector).toBeInstanceOf(WalletStandardConnector)
  })

  it('should validate the metadata', async () => {
    expect(connector.chain).toBe('bip122')
    expect(connector.type).toBe('ANNOUNCED')
    expect(connector.id).toBe(wallet.name)
    expect(connector.name).toBe(wallet.name)
    expect(connector.imageUrl).toBe(wallet.icon)
  })

  it('should throw if feature is not available', async () => {
    wallet = mockWalletStandardProvider({
      features: {}
    })
    connector = new WalletStandardConnector({
      wallet,
      requestedChains
    })
    await expect(connector.connect()).rejects.toThrow(MethodNotSupportedError)
  })

  describe('chains', () => {
    it('should map correctly only chains that are requested and the wallet supports', async () => {
      expect(connector.chains).toEqual([bitcoin])
    })

    it('should map network id aliases', async () => {
      vi.spyOn(wallet, 'chains', 'get').mockReturnValueOnce(['bitcoin:mainnet', 'bitcoin:testnet'])

      expect(connector.chains).toEqual([bitcoin, bitcoinTestnet])
    })
  })

  describe('watchWallets', () => {
    it('should get wallets using the callback', async () => {
      const callbackMock = vi.fn((...args) => {
        expect(args[0]).toBeInstanceOf(WalletStandardConnector)
      })

      WalletStandardConnector.watchWallets({
        callback: callbackMock,
        requestedChains
      })

      expect(callbackMock).toHaveBeenCalled()
    })
  })

  describe('connect', () => {
    it('connect correctly', async () => {
      await expect(connector.connect()).resolves.not.toThrow()
    })

    it('should throw if account is not found', async () => {
      wallet = mockWalletStandardProvider({
        features: {
          'bitcoin:connect': {
            connect: async () => Promise.resolve({ accounts: [] }),
            version: '1.0.0'
          }
        }
      })
      connector = new WalletStandardConnector({
        wallet,
        requestedChains
      })

      await expect(connector.connect()).rejects.toThrow('No account found')
    })
  })

  describe('getAccountAddresses', () => {
    it('should return accounts with purpose, address and publicKey when valid', async () => {
      // Use a valid 33-byte compressed public key
      const validCompressedPubKey = new Uint8Array(33).fill(0x02)
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([
        mockWalletStandardProvider.mockAccount({
          address: 'bc1qtest123',
          publicKey: validCompressedPubKey,
          // @ts-expect-error - purpose is not part of the mock account
          purpose: 'ordinal'
        })
      ])

      const accounts = await connector.getAccountAddresses()

      expect(accounts).toHaveLength(1)
      expect(accounts[0]).toHaveProperty('address')
      expect(accounts[0]).toHaveProperty('publicKey')
      expect(accounts[0]).toHaveProperty('purpose')
      expect(accounts[0]?.address).toBe('bc1qtest123')
      expect(accounts[0]?.publicKey).toBe('02'.repeat(33))
      expect(accounts[0]?.purpose).toBe('ordinal')
    })

    it('should accept valid public key lengths (33, 65, 32 bytes)', async () => {
      const testCases = [
        { length: 33, description: 'compressed' },
        { length: 65, description: 'uncompressed' },
        { length: 32, description: 'x-only (Taproot)' }
      ]

      for (const testCase of testCases) {
        const validPubKey = new Uint8Array(testCase.length).fill(0x02)
        vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([
          mockWalletStandardProvider.mockAccount({
            address: `address_${testCase.length}`,
            publicKey: validPubKey
          })
        ])

        const accounts = await connector.getAccountAddresses()

        expect(accounts[0]?.publicKey).toBe('02'.repeat(testCase.length))
      }
    })

    it('should return undefined publicKey and warn for invalid length (e.g., 42 bytes from MetaMask bug)', async () => {
      // Simulate MetaMask's bug: publicKey is UTF-8 bytes of the address string (42 bytes)
      // A typical Bitcoin address like "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4" is 42 characters
      const invalidPubKey = new Uint8Array(42).fill(0x61) // 42 bytes of 'a'
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([
        mockWalletStandardProvider.mockAccount({
          address: 'bc1qtest123',
          publicKey: invalidPubKey
        })
      ])

      const accounts = await connector.getAccountAddresses()

      expect(accounts).toHaveLength(1)
      expect(accounts[0]?.publicKey).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid public key length (42 bytes)')
      )

      consoleSpy.mockRestore()
    })

    it('should return undefined publicKey for other invalid lengths', async () => {
      const invalidLengths = [0, 1, 20, 31, 34, 64, 66, 100]
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      for (const length of invalidLengths) {
        const invalidPubKey = new Uint8Array(length).fill(0x02)
        vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([
          mockWalletStandardProvider.mockAccount({
            address: `address_${length}`,
            publicKey: invalidPubKey
          })
        ])

        const accounts = await connector.getAccountAddresses()
        expect(accounts[0]?.publicKey).toBeUndefined()
      }

      consoleSpy.mockRestore()
    })

    it('should filter duplicate addresses', async () => {
      const validPubKey = new Uint8Array(33).fill(0x02)
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([
        mockWalletStandardProvider.mockAccount({
          address: 'address1',
          publicKey: validPubKey
        }),
        mockWalletStandardProvider.mockAccount({
          address: 'address1',
          publicKey: new Uint8Array(33).fill(0x03)
        })
      ])

      const accounts = await connector.getAccountAddresses()
      expect(accounts).toHaveLength(1)
      expect(accounts[0]?.address).toBe('address1')
    })
  })

  describe('signMessage', () => {
    it('should sign message correctly', async () => {
      const accountMock = mockWalletStandardProvider.mockAccount({
        address: 'address',
        publicKey: new Uint8Array(Buffer.from('publicKey1'))
      })
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([accountMock])

      const signMessageFeatureSpy = vi.spyOn(
        wallet.features['bitcoin:signMessage'] as any,
        'signMessage'
      )
      await connector.signMessage({ address: 'address', message: 'message1' })
      expect(signMessageFeatureSpy).toHaveBeenCalledWith({
        message: expect.objectContaining(Uint8Array.from([109, 101, 115, 115, 97, 103, 101, 49])),
        account: expect.objectContaining(accountMock)
      })
    })

    it('should log warning when protocol parameter is provided', async () => {
      const accountMock = mockWalletStandardProvider.mockAccount({
        address: 'address',
        publicKey: new Uint8Array(Buffer.from('publicKey1'))
      })
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([accountMock])

      const signMessageFeatureSpy = vi.spyOn(
        wallet.features['bitcoin:signMessage'] as any,
        'signMessage'
      )
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await connector.signMessage({
        address: 'address',
        message: 'message1',
        protocol: 'bip322'
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        'WalletStandardConnector:signMessage - protocol parameter not supported in WalletStandard:bitcoin - signMessage'
      )
      expect(signMessageFeatureSpy).toHaveBeenCalledWith({
        message: expect.objectContaining(Uint8Array.from([109, 101, 115, 115, 97, 103, 101, 49])),
        account: expect.objectContaining(accountMock)
      })

      consoleSpy.mockRestore()
    })

    it('should throw if account is not found', async () => {
      wallet = mockWalletStandardProvider({
        features: {
          'bitcoin:signMessage': {
            signMessage: async () => Promise.reject(new Error('Account not found')),
            version: '1.0.0'
          }
        }
      })
      connector = new WalletStandardConnector({
        wallet,
        requestedChains
      })

      await expect(
        connector.signMessage({ address: 'address1', message: 'message1' })
      ).rejects.toThrow('Account not found')
    })

    it('should throw if response is empty', async () => {
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([
        mockWalletStandardProvider.mockAccount({
          address: 'address'
        })
      ])

      vi.spyOn(wallet.features['bitcoin:signMessage'] as any, 'signMessage').mockReturnValueOnce(
        Promise.resolve([])
      )

      await expect(
        connector.signMessage({ address: 'address', message: 'message1' })
      ).rejects.toThrow('No response from wallet')
    })
  })

  describe('signPSBT', () => {
    it('should sign PSBT correctly and pass sighashTypes as sigHash flag', async () => {
      const accountMock = mockWalletStandardProvider.mockAccount({
        address: 'address',
        publicKey: new Uint8Array(33).fill(0x02) // Valid compressed pubkey
      })
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([accountMock])

      const signPsbtFeatureSpy = vi.spyOn(
        wallet.features['bitcoin:signTransaction'] as any,
        'signTransaction'
      )
      // Return a properly signed PSBT
      signPsbtFeatureSpy.mockReturnValueOnce([{ signedPsbt: createMockSignedPsbt(0) }])

      const response = await connector.signPSBT({
        psbt: 'cHNidDE=', // base64 of 'psbt1'
        signInputs: [
          {
            address: 'address',
            index: 0,
            sighashTypes: [1] // SIGHASH_ALL
          }
        ]
      })

      // Verify sigHash is now passed as 'ALL' instead of undefined
      expect(signPsbtFeatureSpy).toHaveBeenCalledWith({
        psbt: expect.any(Uint8Array),
        inputsToSign: expect.arrayContaining([
          expect.objectContaining({
            account: accountMock,
            signingIndexes: [0],
            sigHash: 'ALL'
          })
        ])
      })
      expect(response.psbt).toBeTruthy()
      expect(response.txid).toBeUndefined()
    })

    it('should convert various sighashTypes correctly', async () => {
      const accountMock = mockWalletStandardProvider.mockAccount({
        address: 'address',
        publicKey: new Uint8Array(33).fill(0x02)
      })

      const testCases = [
        { input: [1], expected: 'ALL' },
        { input: [2], expected: 'NONE' },
        { input: [3], expected: 'SINGLE' },
        { input: [0x81], expected: 'ALL|ANYONECANPAY' },
        { input: [0x82], expected: 'NONE|ANYONECANPAY' },
        { input: [0x83], expected: 'SINGLE|ANYONECANPAY' }
      ]

      for (const testCase of testCases) {
        vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([accountMock])
        const signPsbtFeatureSpy = vi.spyOn(
          wallet.features['bitcoin:signTransaction'] as any,
          'signTransaction'
        )
        signPsbtFeatureSpy.mockReturnValueOnce([{ signedPsbt: createMockSignedPsbt(0) }])

        await connector.signPSBT({
          psbt: 'cHNidDE=',
          signInputs: [{ address: 'address', index: 0, sighashTypes: testCase.input }]
        })

        expect(signPsbtFeatureSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            inputsToSign: expect.arrayContaining([
              expect.objectContaining({ sigHash: testCase.expected })
            ])
          })
        )
      }
    })

    it('should pass sigHash as undefined when sighashTypes is empty', async () => {
      const accountMock = mockWalletStandardProvider.mockAccount({
        address: 'address',
        publicKey: new Uint8Array(33).fill(0x02)
      })
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([accountMock])

      const signPsbtFeatureSpy = vi.spyOn(
        wallet.features['bitcoin:signTransaction'] as any,
        'signTransaction'
      )
      signPsbtFeatureSpy.mockReturnValueOnce([{ signedPsbt: createMockSignedPsbt(0) }])

      await connector.signPSBT({
        psbt: 'cHNidDE=',
        signInputs: [{ address: 'address', index: 0, sighashTypes: [] }]
      })

      expect(signPsbtFeatureSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          inputsToSign: expect.arrayContaining([expect.objectContaining({ sigHash: undefined })])
        })
      )
    })

    it('should throw if account is not found', async () => {
      await expect(
        connector.signPSBT({
          psbt: 'cHNidDE=',
          signInputs: [
            {
              address: 'mock_address',
              index: 0,
              sighashTypes: [1]
            }
          ]
        })
      ).rejects.toThrow('Account with address mock_address not found')
    })

    it('should throw if response is empty', async () => {
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([
        mockWalletStandardProvider.mockAccount({
          address: 'address'
        })
      ])

      vi.spyOn(
        wallet.features['bitcoin:signTransaction'] as any,
        'signTransaction'
      ).mockReturnValueOnce(Promise.resolve([]))

      await expect(
        connector.signPSBT({
          psbt: 'cHNidDE=',
          signInputs: [
            {
              address: 'address',
              index: 0,
              sighashTypes: [1]
            }
          ]
        })
      ).rejects.toThrow('No response from wallet')
    })

    it('should throw if broadcast is true', async () => {
      await expect(
        connector.signPSBT({
          psbt: 'cHNidDE=',
          signInputs: [
            {
              address: 'address',
              index: 0,
              sighashTypes: [1]
            }
          ],
          broadcast: true
        })
      ).rejects.toThrow(MethodNotSupportedError)
    })

    it('should throw if wallet returns unsigned PSBT', async () => {
      const accountMock = mockWalletStandardProvider.mockAccount({
        address: 'address',
        publicKey: new Uint8Array(33).fill(0x02)
      })
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([accountMock])

      const signPsbtFeatureSpy = vi.spyOn(
        wallet.features['bitcoin:signTransaction'] as any,
        'signTransaction'
      )
      // Return an unsigned PSBT
      signPsbtFeatureSpy.mockReturnValueOnce([{ signedPsbt: createMockUnsignedPsbt() }])

      await expect(
        connector.signPSBT({
          psbt: 'cHNidDE=',
          signInputs: [{ address: 'address', index: 0, sighashTypes: [1] }]
        })
      ).rejects.toThrow('Input at index 0 was not signed')
    })
  })

  describe('sendTransfer', () => {
    it('should throw MethodNotSupportedError', async () => {
      await expect(
        connector.sendTransfer({
          amount: '1000',
          recipient: 'address'
        })
      ).rejects.toThrow(MethodNotSupportedError)
    })
  })

  describe('disconnect', () => {
    it('should disconnect correctly', async () => {
      await expect(connector.disconnect()).resolves.not.toThrow()
    })
  })

  describe('request', () => {
    it('should throw MethodNotSupportedError', async () => {
      await expect(connector.request({} as any)).rejects.toThrow(MethodNotSupportedError)
    })
  })

  describe('events', () => {
    it('should not throw if events feature is not available', async () => {
      delete (wallet.features as any)['standard:events']
      await expect(connector.connect()).resolves.not.toThrow()
    })
  })
})
