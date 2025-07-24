import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { CoreHelperUtil } from '@reown/appkit-controllers'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { UnisatConnector } from '../../src/connectors/UnisatConnector'
import type { UnisatConnector as UnisatConnectorTypes } from '../../src/connectors/UnisatConnector/types'
import { MethodNotSupportedError } from '../../src/errors/MethodNotSupportedError'

function mockUnisatWallet(): {
  [K in keyof UnisatConnectorTypes.Wallet]: Mock<UnisatConnectorTypes.Wallet[K]>
} {
  return {
    requestAccounts: vi.fn(() => Promise.resolve(['mock_address'])),
    getAccounts: vi.fn(() => Promise.resolve(['mock_address'])),
    signMessage: vi.fn(() => Promise.resolve('mock_signature')),
    signPsbt: vi.fn(() => Promise.resolve(Buffer.from('mock_psbt').toString('hex'))),
    pushPsbt: vi.fn(() => Promise.resolve('mock_txhash')),
    sendBitcoin: vi.fn(() => Promise.resolve('mock_txhash')),
    on: vi.fn(),
    removeListener: vi.fn(),
    getPublicKey: vi.fn(() => Promise.resolve('mock_public_key')),
    switchChain: vi.fn(() =>
      Promise.resolve({
        enum: 'BITCOIN_MAINNET',
        name: 'Bitcoin Mainnet',
        network: 'livenet'
      })
    )
  }
}

describe('UnisatConnector', () => {
  let wallet: ReturnType<typeof mockUnisatWallet>
  let requestedChains: CaipNetwork[]
  let connector: UnisatConnector
  let getActiveNetwork: Mock<() => CaipNetwork | undefined>
  let imageUrl: string

  beforeEach(() => {
    imageUrl = 'mock_image_url'
    requestedChains = [bitcoin, bitcoinTestnet]
    getActiveNetwork = vi.fn(() => bitcoin)
    wallet = mockUnisatWallet()
    connector = new UnisatConnector({
      id: 'unisat',
      name: 'Unisat Wallet',
      wallet,
      requestedChains,
      getActiveNetwork,
      imageUrl
    })
  })

  it('should validate metadata', () => {
    expect(connector.id).toBe('unisat')
    expect(connector.name).toBe('Unisat Wallet')
    expect(connector.chain).toBe('bip122')
    expect(connector.type).toBe('ANNOUNCED')
    expect(connector.imageUrl).toBe('mock_image_url')
  })

  it('should return only mainnet chain', () => {
    expect(connector.chains).toEqual([bitcoin])
  })

  describe('connect', () => {
    it('should connect and return address', async () => {
      const address = await connector.connect()
      expect(address).toBe('mock_address')
      expect(wallet.requestAccounts).toHaveBeenCalled()
    })

    it('should emit accountsChanged on connect', async () => {
      const listener = vi.fn()
      connector.on('accountsChanged', listener)
      await connector.connect()
      expect(listener).toHaveBeenCalledWith(['mock_address'])
    })

    it('should bind events', async () => {
      await connector.connect()
      expect(wallet.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function))
    })
  })

  describe('disconnect', () => {
    it('should resolve and unbind events', async () => {
      await connector.disconnect()
      expect(wallet.removeListener).toHaveBeenCalled()
    })
  })

  describe('getAccountAddresses', () => {
    it('should get account addresses', async () => {
      const accounts = await connector.getAccountAddresses()

      console.log(accounts)

      expect(accounts).toEqual([
        { address: 'mock_address', purpose: 'payment', publicKey: 'mock_public_key' }
      ])
      expect(wallet.requestAccounts).toHaveBeenCalled()
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
      expect(wallet.sendBitcoin).toHaveBeenCalledWith('mock_to_address', 0.000015)
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
      expect(wallet.pushPsbt).not.toHaveBeenCalled()
    })

    it('should sign a PSBT with broadcast', async () => {
      getActiveNetwork.mockReturnValueOnce(bitcoinTestnet)
      const result = await connector.signPSBT({
        psbt: Buffer.from('mock_psbt').toString('base64'),
        signInputs: [],
        broadcast: true
      })

      expect(result).toEqual({ psbt: 'bW9ja19wc2J0', txid: 'mock_txhash' })
      expect(wallet.pushPsbt).toHaveBeenCalled()
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

    it('should resolve and unbind events', async () => {
      await connector.disconnect()
      expect(wallet.removeListener).toHaveBeenCalled()
    })
  })

  describe('getWallet', () => {
    it.each(['binancew3w', 'bitget', 'unisat'] as UnisatConnectorTypes.Id[])(
      'should return undefined if there is no %s wallet',
      id => {
        expect(
          UnisatConnector.getWallet({
            getActiveNetwork,
            requestedChains: [],
            id,
            name: `${id} wallet`,
            imageUrl: ''
          })
        ).toBeUndefined()
      }
    )

    it('should return the Connector if there is a unisat wallet', () => {
      ;(window as any).unisat = wallet
      const connector = UnisatConnector.getWallet({
        getActiveNetwork,
        id: 'unisat',
        name: 'Unisat Wallet',
        requestedChains,
        imageUrl: ''
      })
      expect(connector).toBeInstanceOf(UnisatConnector)
      expect(connector?.id).toBe('unisat')
    })

    it('should return the Connector if there is a bitget wallet', () => {
      ;(window as any).bitkeep = { unisat: wallet }
      const connector = UnisatConnector.getWallet({
        getActiveNetwork,
        id: 'bitget',
        name: 'Bitget Wallet',
        requestedChains,
        imageUrl: ''
      })
      expect(connector).toBeInstanceOf(UnisatConnector)
      expect(connector?.id).toBe('bitget')
    })

    it('should return the Connector if there is a binance web3 wallet', () => {
      ;(window as any).binancew3w = { bitcoin: wallet }
      const connector = UnisatConnector.getWallet({
        getActiveNetwork,
        id: 'binancew3w',
        name: 'Binance Web3 Wallet',
        requestedChains,
        imageUrl: ''
      })
      expect(connector).toBeInstanceOf(UnisatConnector)
      expect(connector?.id).toBe('binancew3w')
    })

    it('should return undefined if window is undefined (server-side)', () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(false)

      expect(
        UnisatConnector.getWallet({
          getActiveNetwork,
          requestedChains: [],
          id: 'unisat',
          name: 'Unisat Wallet',
          imageUrl: ''
        })
      ).toBeUndefined()
    })
  })

  describe('getPublicKey', () => {
    it('should return the public key', async () => {
      const publicKey = await connector.getPublicKey()
      expect(publicKey).toBe('mock_public_key')
      expect(wallet.getPublicKey).toHaveBeenCalled()
    })
  })

  describe('switchNetwork', () => {
    it('should switch network', async () => {
      await connector.switchNetwork(bitcoin.caipNetworkId)
      expect(wallet.switchChain).toHaveBeenCalledWith('BITCOIN_MAINNET')
    })
  })
})
