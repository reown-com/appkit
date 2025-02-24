import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { bitcoin, bitcoinTestnet, mainnet } from '@reown/appkit/networks'

import { WalletStandardConnector } from '../../src/connectors/WalletStandardConnector'
import { MethodNotSupportedError } from '../../src/errors/MethodNotSupportedError'
import { mockWalletStandardProvider } from '../mocks/mockWalletStandard'

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

    it('should bind events', async () => {
      const eventsFeatureSpy = vi.spyOn(wallet.features['standard:events'] as any, 'on')
      await connector.connect()
      expect(eventsFeatureSpy).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })

  describe('getAccountAddresses', () => {
    it('should map accounts correctly', async () => {
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([
        mockWalletStandardProvider.mockAccount({
          address: 'address1',
          publicKey: new Uint8Array(Buffer.from('publicKey1'))
        })
      ])

      const accounts = await connector.getAccountAddresses()
      expect(accounts).toEqual([
        {
          address: 'address1',
          publicKey: '7075626c69634b657931',
          purpose: 'payment'
        }
      ])
    })

    it('should filter duplicate addresses', async () => {
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([
        mockWalletStandardProvider.mockAccount({
          address: 'address1',
          publicKey: new Uint8Array(Buffer.from('publicKey1'))
        }),
        mockWalletStandardProvider.mockAccount({
          address: 'address1',
          publicKey: new Uint8Array(Buffer.from('publicKey2'))
        })
      ])

      const accounts = await connector.getAccountAddresses()
      expect(accounts).toEqual([
        {
          address: 'address1',
          publicKey: '7075626c69634b657931',
          purpose: 'payment'
        }
      ])
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
    it('should sign PSBT correctly', async () => {
      const accountMock = mockWalletStandardProvider.mockAccount({
        address: 'address',
        publicKey: new Uint8Array(Buffer.from('publicKey1'))
      })
      vi.spyOn(wallet, 'accounts', 'get').mockReturnValueOnce([accountMock])

      const signPsbtFeatureSpy = vi.spyOn(
        wallet.features['bitcoin:signTransaction'] as any,
        'signTransaction'
      )
      signPsbtFeatureSpy.mockReturnValueOnce([{ signedPsbt: Buffer.from('mock_signed_psbt') }])

      const response = await connector.signPSBT({
        psbt: 'psbt1',
        signInputs: [
          {
            address: 'address',
            index: 0,
            sighashTypes: [1]
          }
        ]
      })
      expect(signPsbtFeatureSpy).toHaveBeenCalledWith({
        psbt: expect.objectContaining(Uint8Array.from([])),
        inputsToSign: expect.arrayContaining([
          expect.objectContaining({
            account: accountMock,
            signingIndexes: [0],
            sigHash: undefined
          })
        ])
      })
      expect(response).toEqual({ psbt: 'bW9ja19zaWduZWRfcHNidA==', txid: undefined })
    })

    it('should throw if account is not found', async () => {
      await expect(
        connector.signPSBT({
          psbt: 'psbt1',
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
          psbt: 'psbt1',
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
          psbt: 'psbt1',
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

    it('should unbind events', async () => {
      const unsubscribeCallbackMock = vi.fn<() => void>(() => {})
      vi.spyOn(wallet.features['standard:events'] as any, 'on').mockReturnValueOnce(
        unsubscribeCallbackMock
      )
      await connector.connect()
      await connector.disconnect()
      expect(unsubscribeCallbackMock).toHaveBeenCalled()
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

    it('should emit disconnect if change event has no accounts', async () => {
      const eventsFeatureSpy = vi.spyOn(wallet.features['standard:events'] as any, 'on')
      await connector.connect()
      const changeCallback = eventsFeatureSpy.mock.calls[0]![1] as (data: any) => void
      const disconnectCallback = vi.fn(() => {})
      connector.on('disconnect', disconnectCallback)

      changeCallback({ accounts: [] })
      expect(disconnectCallback).toHaveBeenCalled()
    })

    it('should emit accountsChanged if change event has accounts', async () => {
      const eventsFeatureSpy = vi.spyOn(wallet.features['standard:events'] as any, 'on')
      await connector.connect()
      const changeCallback = eventsFeatureSpy.mock.calls[0]![1] as (data: any) => void
      const accountsChangedCallback = vi.fn(() => {})
      connector.on('accountsChanged', accountsChangedCallback)

      changeCallback({ accounts: [{ address: 'address1' }, { address: 'address2' }] })
      expect(accountsChangedCallback).toHaveBeenCalledWith(['address1', 'address2'])
    })
  })
})
