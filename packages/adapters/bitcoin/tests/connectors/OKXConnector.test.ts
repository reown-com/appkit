import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { ChainController, CoreHelperUtil } from '@reown/appkit-controllers'
import { bitcoin, bitcoinSignet, bitcoinTestnet } from '@reown/appkit/networks'

import { OKXConnector } from '../../src/connectors/OKXConnector'
import { MethodNotSupportedError } from '../../src/errors/MethodNotSupportedError'

function createWalletMock() {
  const connect = vi.fn(() => Promise.resolve({ address: 'mock_address', publicKey: 'publicKey' }))
  const disconnect = vi.fn(() => Promise.resolve())
  const getAccounts = vi.fn(() => Promise.resolve(['mock_address']))
  const signMessage = vi.fn(() => Promise.resolve('mock_signature'))
  const signPsbt = vi.fn(() => Promise.resolve(Buffer.from('mock_psbt').toString('hex')))
  const pushPsbt = vi.fn(() => Promise.resolve('mock_txhash'))
  const send = vi.fn(() => Promise.resolve({ txhash: 'mock_txhash' }))
  const on = vi.fn()
  const removeAllListeners = vi.fn()
  const getPublicKey = vi.fn(() => Promise.resolve('publicKey'))

  const wallet = {
    selectedAccount: {
      address: 'signet_address',
      purpose: 'payment',
      publicKey: 'signet_public'
    } as any,
    connect,
    disconnect,
    getAccounts,
    signMessage,
    signPsbt,
    pushPsbt,
    send,
    on,
    removeAllListeners,
    getPublicKey
  } as unknown as OKXConnector.Wallet

  return {
    wallet,
    fns: {
      connect,
      disconnect,
      getAccounts,
      signMessage,
      signPsbt,
      pushPsbt,
      send,
      on,
      removeAllListeners,
      getPublicKey
    }
  }
}

describe('OKXConnector', () => {
  let requestedChains: CaipNetwork[]
  let connector: OKXConnector
  let mainnet: ReturnType<typeof createWalletMock>
  let testnet: ReturnType<typeof createWalletMock>
  let signet: ReturnType<typeof createWalletMock>

  beforeEach(() => {
    requestedChains = [bitcoin, bitcoinTestnet, bitcoinSignet]
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(bitcoin)
    mainnet = createWalletMock()
    testnet = createWalletMock()
    signet = createWalletMock()
    ;(window as any).okxwallet = {
      bitcoin: mainnet.wallet,
      bitcoinTestnet: testnet.wallet,
      bitcoinSignet: signet.wallet,
      cardano: { icon: 'mock_image_url' }
    }
    connector = new OKXConnector({ requestedChains })
  })

  it('should validate metadata', () => {
    expect(connector.id).toBe('OKX')
    expect(connector.name).toBe('OKX Wallet')
    expect(connector.chain).toBe('bip122')
    expect(connector.type).toBe('ANNOUNCED')
    expect(connector.imageUrl).toBe('mock_image_url')
  })

  it('should return requested chains', () => {
    expect(connector.chains).toEqual([bitcoin, bitcoinTestnet, bitcoinSignet])
  })

  describe('connect', () => {
    it('should connect the wallet', async () => {
      const address = await connector.connect()

      expect(address).toBe('mock_address')
      expect(mainnet.fns.connect).toHaveBeenCalled()
    })

    it('should emit accountsChanged when wallet emits accountChanged', async () => {
      const listener = vi.fn()
      connector.on('accountsChanged', listener)
      await connector.connect()
      // trigger bound listener
      mainnet.fns.on.mock.calls[0]![1]({ address: 'mock_address' })
      expect(listener).toHaveBeenCalledWith(['mock_address'])
    })

    it('should bind events', async () => {
      await connector.connect()

      expect(mainnet.fns.removeAllListeners).toHaveBeenCalled()
      expect(mainnet.fns.on).toHaveBeenNthCalledWith(1, 'accountChanged', expect.any(Function))
      expect(mainnet.fns.on).toHaveBeenNthCalledWith(2, 'disconnect', expect.any(Function))
    })

    it('should connect with testnet', async () => {
      const address = await connector.connect({ caipNetworkId: bitcoinTestnet.caipNetworkId })
      expect(address).toBe('mock_address')
      expect(testnet.fns.connect).toHaveBeenCalled()
      expect(mainnet.fns.connect).not.toHaveBeenCalled()
    })
  })

  describe('disconnect', () => {
    it('should disconnect the wallet', async () => {
      await connector.disconnect()

      expect(mainnet.fns.disconnect).toHaveBeenCalled()
    })

    it('should unbind events', async () => {
      await connector.disconnect()

      expect(mainnet.fns.removeAllListeners).toHaveBeenCalled()
    })
  })

  describe('getAccountAddresses', () => {
    it('should get account addresses', async () => {
      const accounts = await connector.getAccountAddresses()

      expect(accounts).toEqual([
        { address: 'mock_address', purpose: 'payment', publicKey: 'publicKey' }
      ])
      expect(mainnet.fns.getAccounts).toHaveBeenCalled()
    })
  })

  describe('signMessage', () => {
    it('should sign a message', async () => {
      const signature = await connector.signMessage({ address: 'mock_address', message: 'message' })

      expect(signature).toBe('mock_signature')
      expect(mainnet.fns.signMessage).toHaveBeenCalledWith('message', undefined)
    })

    it('should sign a message with ecdsa protocol', async () => {
      const signature = await connector.signMessage({
        address: 'mock_address',
        message: 'message',
        protocol: 'ecdsa'
      })

      expect(signature).toBe('mock_signature')
      expect(mainnet.fns.signMessage).toHaveBeenCalledWith('message', 'ecdsa')
    })

    it('should sign a message with bip322 protocol', async () => {
      const signature = await connector.signMessage({
        address: 'mock_address',
        message: 'message',
        protocol: 'bip322'
      })

      expect(signature).toBe('mock_signature')
      expect(mainnet.fns.signMessage).toHaveBeenCalledWith('message', 'bip322-simple')
    })
  })

  describe('sendTransfer', () => {
    it('should send a transfer', async () => {
      const txid = await connector.sendTransfer({ amount: '1500', recipient: 'mock_to_address' })

      expect(txid).toBe('mock_txhash')
      expect(mainnet.fns.send).toHaveBeenCalledWith({
        from: 'mock_address',
        to: 'mock_to_address',
        value: '0.000015'
      })
    })

    it('should throw an error if the network is unavailable', async () => {
      vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(undefined)

      await expect(
        connector.sendTransfer({ amount: '1500', recipient: 'mock_to_address' })
      ).rejects.toThrow('No active network available')
    })

    it('should throw an error if no account is available', async () => {
      mainnet.fns.getAccounts.mockResolvedValueOnce([])

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
      vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(bitcoinTestnet)

      const result = await connector.signPSBT({
        psbt: Buffer.from('mock_psbt').toString('base64'),
        signInputs: [],
        broadcast: true
      })

      expect(result).toEqual({ psbt: 'bW9ja19wc2J0', txid: 'mock_txhash' })
    })

    it('should sign a PSBT with partial signing without broadcast', async () => {
      const signInputs = [
        {
          index: 0,
          address: 'mock_address',
          publicKey: 'mock_pubkey',
          sighashTypes: [1, 3],
          disableTweakSigner: true
        }
      ]
      const psbtBase64 = Buffer.from('mock_psbt').toString('base64')
      const result = await connector.signPSBT({
        psbt: psbtBase64,
        signInputs,
        broadcast: false
      })
      expect(result).toEqual({ psbt: 'bW9ja19wc2J0', txid: undefined })
      expect(mainnet.fns.signPsbt).toHaveBeenCalledWith(
        Buffer.from(psbtBase64, 'base64').toString('hex'),
        {
          autoFinalized: false,
          toSignInputs: [
            {
              index: 0,
              address: 'mock_address',
              publicKey: 'mock_pubkey',
              sighashTypes: [1, 3],
              disableTweakSigner: true
            }
          ]
        }
      )
      expect(mainnet.fns.pushPsbt).not.toHaveBeenCalled()
    })
    it('should throw error when trying to broadcast with partial signing', async () => {
      const signInputs = [
        {
          index: 0,
          address: 'mock_address',
          publicKey: 'mock_pubkey',
          sighashTypes: [1, 3],
          disableTweakSigner: true
        }
      ]
      await expect(
        connector.signPSBT({
          psbt: Buffer.from('mock_psbt').toString('base64'),
          signInputs,
          broadcast: true
        })
      ).rejects.toThrow('Broadcast not supported for partial signing')
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

      mainnet.fns.on.mock.calls[0]![1]({ address: 'mock_address' })

      expect(listener).toHaveBeenCalled()
    })

    it('should emit disconnect event', async () => {
      const listener = vi.fn()
      connector.on('disconnect', listener)
      await connector.connect()

      mainnet.fns.on.mock.calls[1]![1]()

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('getWallet', () => {
    it('should return undefined if there is no wallet', () => {
      ;(window as any).okxwallet = undefined
      const localConnector = new OKXConnector({ requestedChains })
      expect(localConnector.getWallet()).toBeUndefined()
    })

    it('should return the Connector if there is a wallet', () => {
      ;(window as any).okxwallet = { bitcoin: mainnet.wallet }
      const localConnector = new OKXConnector({ requestedChains: [bitcoin] })
      expect(localConnector).toBeInstanceOf(OKXConnector)
    })

    it('should get image url', () => {
      ;(window as any).okxwallet = { bitcoin: mainnet.wallet, cardano: { icon: 'mock_image' } }
      const localConnector = new OKXConnector({ requestedChains: [bitcoin] })
      expect(localConnector?.imageUrl).toBe('mock_image')
    })

    it('should return undefined if window is undefined (server-side)', () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(false)

      expect(new OKXConnector({ requestedChains: [bitcoin] }).getWallet()).toBeUndefined()
    })
  })

  describe('getPublicKey', () => {
    it('should return the public key', async () => {
      vi.spyOn(connector, 'getWallet').mockReturnValue(mainnet.wallet)
      const publicKey = await connector.getPublicKey()
      expect(publicKey).toBe('publicKey')
      expect(mainnet.fns.getPublicKey).toHaveBeenCalled()
    })
  })

  describe('switchNetwork', () => {
    it('should emit chainChanged with the resolved chain id and unbind listeners', async () => {
      const chainChangedListener = vi.fn()
      vi.spyOn(connector, 'getWallet').mockReturnValue(mainnet.wallet)
      connector.on('chainChanged', chainChangedListener)
      await connector.switchNetwork(bitcoinTestnet.caipNetworkId)

      expect(mainnet.fns.removeAllListeners).toHaveBeenCalled()
      expect(chainChangedListener).toHaveBeenCalledWith(bitcoinTestnet.id)
      expect(testnet.fns.connect).not.toHaveBeenCalled()
    })

    it('should throw error when wallet is not available', async () => {
      await expect(connector.switchNetwork('bip122:fake-network')).rejects.toThrow(
        'OKX Wallet wallet does not support network switching'
      )
    })
  })
})
