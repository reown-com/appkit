import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { CoreHelperUtil } from '@reown/appkit-controllers'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { BitgetConnector } from '../../src/connectors/BitgetConnector'
import { MethodNotSupportedError } from '../../src/errors/MethodNotSupportedError'

function mockBitgetWallet(): {
  [K in keyof BitgetConnector.Wallet]: Mock<BitgetConnector.Wallet[K]>
} {
  return {
    requestAccounts: vi.fn(() => Promise.resolve(['mock_address'])),
    disconnect: vi.fn(),
    getAccounts: vi.fn(() => Promise.resolve(['mock_address'])),
    signMessage: vi.fn(() => Promise.resolve('mock_signature')),
    signPsbt: vi.fn(() => Promise.resolve(Buffer.from('mock_psbt').toString('hex'))),
    sendBitcoin: vi.fn(() => Promise.resolve('mock_txhash')),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
    getPublicKey: vi.fn(() => Promise.resolve('publicKey')),
    pushPsbt: vi.fn(() => Promise.resolve('mock_txhash'))
  }
}

describe('BitgetConnector', () => {
  let wallet: ReturnType<typeof mockBitgetWallet>
  let requestedChains: CaipNetwork[]
  let connector: BitgetConnector
  let getActiveNetwork: Mock<() => CaipNetwork | undefined>
  let imageUrl: string

  beforeEach(() => {
    imageUrl = 'mock_image_url'
    requestedChains = [bitcoin, bitcoinTestnet]
    getActiveNetwork = vi.fn(() => bitcoin)
    wallet = mockBitgetWallet()
    connector = new BitgetConnector({ wallet, requestedChains, getActiveNetwork, imageUrl })
  })

  it('should validate metadata', () => {
    expect(connector.id).toBe('Bitget')
    expect(connector.name).toBe('Bitget Wallet')
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
      expect(wallet.requestAccounts).toHaveBeenCalled()
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
      expect(wallet.signMessage).toHaveBeenCalledWith('message')
    })
  })

  describe('sendTransfer', () => {
    it('should send a transfer', async () => {
      const txid = await connector.sendTransfer({ amount: '1500', recipient: 'mock_to_address' })

      expect(txid).toBe('mock_txhash')
      expect(wallet.sendBitcoin).toHaveBeenCalledWith('mock_to_address', '1500')
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
    it('should throw an error because signPSBT is not supported', async () => {
      await expect(connector.signPSBT({} as any)).rejects.toThrow(MethodNotSupportedError)
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
      expect(BitgetConnector.getWallet({ getActiveNetwork, requestedChains: [] })).toBeUndefined()
    })

    it('should return the Connector if there is a wallet', () => {
      ;(window as any).bitkeep = {}
      ;(window as any).bitkeep.unisat = wallet
      const connector = BitgetConnector.getWallet({ getActiveNetwork, requestedChains })
      expect(connector).toBeInstanceOf(BitgetConnector)
    })

    it('should get image url', () => {
      ;(window as any).bitkeep = {}
      ;(window as any).bitkeep.unisat = wallet
      ;(window as any).bitkeep.suiWallet = { icon: 'mock_image' }
      const connector = BitgetConnector.getWallet({ getActiveNetwork, requestedChains })
      expect(connector?.imageUrl).toBe('mock_image')
    })

    it('should return undefined if window is undefined (server-side)', () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(false)

      expect(BitgetConnector.getWallet({ getActiveNetwork, requestedChains })).toBeUndefined()
    })
  })

  describe('getPublicKey', () => {
    it('should return the public key', async () => {
      const publicKey = await connector.getPublicKey()
      expect(publicKey).toBe('publicKey')
      expect(wallet.getPublicKey).toHaveBeenCalled()
    })
  })
})
