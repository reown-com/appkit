import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { CoreHelperUtil } from '@reown/appkit-controllers'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { OKXConnector } from '../../src/connectors/OKXConnector'
import { MethodNotSupportedError } from '../../src/errors/MethodNotSupportedError'

function mockOKXWallet(): { [K in keyof OKXConnector.Wallet]: Mock<OKXConnector.Wallet[K]> } {
  return {
    connect: vi.fn(() => Promise.resolve({ address: 'mock_address', publicKey: 'publicKey' })),
    disconnect: vi.fn(),
    getAccounts: vi.fn(() => Promise.resolve(['mock_address'])),
    signMessage: vi.fn(() => Promise.resolve('mock_signature')),
    signPsbt: vi.fn(() => Promise.resolve(Buffer.from('mock_psbt').toString('hex'))),
    pushPsbt: vi.fn(() => Promise.resolve('mock_txhash')),
    send: vi.fn(() => Promise.resolve({ txhash: 'mock_txhash' })),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
    getPublicKey: vi.fn(() => Promise.resolve('publicKey'))
  }
}

describe('OKXConnector', () => {
  let wallet: ReturnType<typeof mockOKXWallet>
  let requestedChains: CaipNetwork[]
  let connector: OKXConnector
  let getActiveNetwork: Mock<() => CaipNetwork | undefined>
  let imageUrl: string

  beforeEach(() => {
    imageUrl = 'mock_image_url'
    requestedChains = [bitcoin, bitcoinTestnet]
    getActiveNetwork = vi.fn(() => bitcoin)
    wallet = mockOKXWallet()
    connector = new OKXConnector({ wallet, requestedChains, getActiveNetwork, imageUrl })
  })

  it('should validate metadata', () => {
    expect(connector.id).toBe('OKX')
    expect(connector.name).toBe('OKX Wallet')
    expect(connector.chain).toBe('bip122')
    expect(connector.type).toBe('ANNOUNCED')
    expect(connector.imageUrl).toBe('mock_image_url')
  })

  it('should return only mainnet chain', () => {
    expect(connector.chains).toEqual([bitcoin])
  })

  describe('connect', () => {
    it('should connect the wallet', async () => {
      const address = await connector.connect()

      expect(address).toBe('mock_address')
      expect(wallet.connect).toHaveBeenCalled()
    })

    it('should emit accountsChanged event on connect', async () => {
      const listener = vi.fn()
      connector.on('accountsChanged', listener)
      await connector.connect()
      expect(listener).toHaveBeenCalledWith(['mock_address'])
    })

    it('should bind events', async () => {
      await connector.connect()

      expect(wallet.removeAllListeners).toHaveBeenCalled()
      expect(wallet.on).toHaveBeenNthCalledWith(1, 'accountChanged', expect.any(Function))
      expect(wallet.on).toHaveBeenNthCalledWith(2, 'disconnect', expect.any(Function))
    })
  })

  describe('disconnect', () => {
    it('should disconnect the wallet', async () => {
      await connector.disconnect()

      expect(wallet.disconnect).toHaveBeenCalled()
    })

    it('should unbind events', async () => {
      await connector.disconnect()

      expect(wallet.removeAllListeners).toHaveBeenCalled()
    })
  })

  describe('getAccountAddresses', () => {
    it('should get account addresses', async () => {
      const accounts = await connector.getAccountAddresses()

      expect(accounts).toEqual([
        { address: 'mock_address', purpose: 'payment', publicKey: 'publicKey' }
      ])
      expect(wallet.getAccounts).toHaveBeenCalled()
    })
  })

  describe('signMessage', () => {
    it('should sign a message', async () => {
      const signature = await connector.signMessage({ address: 'mock_address', message: 'message' })

      expect(signature).toBe('mock_signature')
      expect(wallet.signMessage).toHaveBeenCalledWith('message', undefined)
    })

    it('should sign a message with ecdsa protocol', async () => {
      const signature = await connector.signMessage({
        address: 'mock_address',
        message: 'message',
        protocol: 'ecdsa'
      })

      expect(signature).toBe('mock_signature')
      expect(wallet.signMessage).toHaveBeenCalledWith('message', 'ecdsa')
    })

    it('should sign a message with bip322 protocol', async () => {
      const signature = await connector.signMessage({
        address: 'mock_address',
        message: 'message',
        protocol: 'bip322'
      })

      expect(signature).toBe('mock_signature')
      expect(wallet.signMessage).toHaveBeenCalledWith('message', 'bip322-simple')
    })
  })

  describe('sendTransfer', () => {
    it('should send a transfer', async () => {
      const txid = await connector.sendTransfer({ amount: '1500', recipient: 'mock_to_address' })

      expect(txid).toBe('mock_txhash')
      expect(wallet.send).toHaveBeenCalledWith({
        from: 'mock_address',
        to: 'mock_to_address',
        value: '0.000015'
      })
    })

    it('should throw an error if the network is unavailable', async () => {
      getActiveNetwork.mockReturnValueOnce(undefined)

      await expect(
        connector.sendTransfer({ amount: '1500', recipient: 'mock_to_address' })
      ).rejects.toThrow('No active network available')
    })

    it('should throw an error if no account is available', async () => {
      wallet.getAccounts.mockResolvedValueOnce([])

      await expect(
        connector.sendTransfer({ amount: '1500', recipient: 'mock_to_address' })
      ).rejects.toThrow('No account available')
    })
  })

  describe('signPSBT', () => {
    it('should sign a PSBT without broadcast', async () => {
      const result = await connector.signPSBT({
        psbt: Buffer.from('mock_psbt').toString('base64'),
        signInputs: [],
        broadcast: false
      })

      expect(result).toEqual({ psbt: 'bW9ja19wc2J0', txid: undefined })
    })

    it('should sign a PSBT with broadcast', async () => {
      getActiveNetwork.mockReturnValueOnce(bitcoinTestnet)

      const result = await connector.signPSBT({
        psbt: Buffer.from('mock_psbt').toString('base64'),
        signInputs: [],
        broadcast: true
      })

      expect(result).toEqual({ psbt: 'bW9ja19wc2J0', txid: 'mock_txhash' })
    })
  })

  describe('request', () => {
    it('should throw an error because request is not supported', async () => {
      await expect(connector.request({} as any)).rejects.toThrow(MethodNotSupportedError)
    })
  })

  describe('events', () => {
    it('should emit accountChanged event', async () => {
      const listener = vi.fn(account => {
        expect(account).toEqual(['mock_address'])
      })
      connector.on('accountsChanged', listener)
      await connector.connect()

      wallet.on.mock.calls[0]![1]({ address: 'mock_address' })

      expect(listener).toHaveBeenCalled()
    })

    it('should emit disconnect event', async () => {
      const listener = vi.fn()
      connector.on('disconnect', listener)
      await connector.connect()

      wallet.on.mock.calls[1]![1]()

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('getWallet', () => {
    it('should return undefined if there is no wallet', () => {
      expect(OKXConnector.getWallet({ getActiveNetwork, requestedChains: [] })).toBeUndefined()
    })

    it('should return the Connector if there is a wallet', () => {
      ;(window as any).okxwallet = { bitcoin: wallet }
      const connector = OKXConnector.getWallet({ getActiveNetwork, requestedChains })
      expect(connector).toBeInstanceOf(OKXConnector)
    })

    it('should get image url', () => {
      ;(window as any).okxwallet = { bitcoin: wallet, cardano: { icon: 'mock_image' } }
      const connector = OKXConnector.getWallet({ getActiveNetwork, requestedChains })
      expect(connector?.imageUrl).toBe('mock_image')
    })

    it('should return undefined if window is undefined (server-side)', () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(false)

      expect(OKXConnector.getWallet({ getActiveNetwork, requestedChains })).toBeUndefined()
    })
  })

  describe('getPublicKey', () => {
    it('should return the public key', async () => {
      const publicKey = await connector.getPublicKey()
      expect(publicKey).toBe('publicKey')
      expect(wallet.getPublicKey).toHaveBeenCalled()
    })
  })

  describe('switchNetwork', () => {
    it('should switch to testnet network and connect', async () => {
      const testnetWallet = mockOKXWallet()
      const testnetConnector = new OKXConnector({
        wallet: testnetWallet,
        requestedChains,
        getActiveNetwork,
        imageUrl: 'mock_image'
      })

      vi.spyOn(OKXConnector, 'getWallet').mockReturnValue(testnetConnector)

      const accountsChangedListener = vi.fn()
      connector.on('accountsChanged', accountsChangedListener)

      // Switch to testnet bitcoin
      await connector.switchNetwork('bip122:000000000933ea01ad0ee984209779ba')

      expect(testnetWallet.connect).toHaveBeenCalled()
      expect(accountsChangedListener).toHaveBeenCalledWith(['mock_address'])
    })

    it('should throw error when wallet is not available', async () => {
      vi.spyOn(OKXConnector, 'getWallet').mockReturnValue(undefined)

      await expect(connector.switchNetwork('bip122:fake-network')).rejects.toThrow(
        'OKX Wallet wallet does not support network switching'
      )
    })
  })
})
