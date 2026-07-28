import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CoreHelperUtil } from '@reown/appkit-controllers'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { TrezorConnector } from '../../src/connectors/TrezorConnector'
import { MethodNotSupportedError } from '../../src/errors/MethodNotSupportedError'

// Mock TrezorConnect
vi.mock('@trezor/connect-web', () => ({
  default: {
    init: vi.fn(() => Promise.resolve()),
    getAddress: vi.fn(() =>
      Promise.resolve({
        success: true,
        payload: [
          {
            address: 'bc1qmock_payment_address',
            publicKey: 'mock_public_key_payment',
            serializedPath: "m/84'/0'/0'/0/0"
          },
          {
            address: 'bc1qmock_ordinal_address',
            publicKey: 'mock_public_key_ordinal',
            serializedPath: "m/84'/0'/0'/0/1"
          }
        ]
      })
    ),
    signMessage: vi.fn(() =>
      Promise.resolve({
        success: true,
        payload: {
          signature: 'mock_signature'
        }
      })
    ),
    composeTransaction: vi.fn(() =>
      Promise.resolve({
        success: true,
        payload: {
          txid: 'mock_txid'
        }
      })
    ),
    signTransaction: vi.fn(() =>
      Promise.resolve({
        success: true,
        payload: {
          serializedTx:
            '0100000001000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000'
        }
      })
    ),
    pushTransaction: vi.fn(() =>
      Promise.resolve({
        success: true,
        payload: {
          txid: 'mock_broadcast_txid'
        }
      })
    )
  }
}))

describe('TrezorConnector', () => {
  let connector: TrezorConnector

  beforeEach(() => {
    vi.clearAllMocks()
    connector = new TrezorConnector({
      requestedChains: [bitcoin, bitcoinTestnet]
    })
  })

  it('should validate metadata', () => {
    expect(connector.id).toBe('trezor')
    expect(connector.name).toBe('Trezor')
    expect(connector.chain).toBe('bip122')
    expect(connector.type).toBe('ANNOUNCED')
  })

  it('should return bitcoin chains', () => {
    expect(connector.chains).toEqual([bitcoin, bitcoinTestnet])
  })

  describe('connect', () => {
    it('should connect and return payment address', async () => {
      const address = await connector.connect()
      expect(address).toBe('bc1qmock_payment_address')
    })

    it('should emit accountsChanged on connect', async () => {
      const listener = vi.fn()
      connector.on('accountsChanged', listener)
      await connector.connect()
      expect(listener).toHaveBeenCalledWith(['bc1qmock_payment_address'])
    })
  })

  describe('disconnect', () => {
    it('should emit disconnect event', async () => {
      const listener = vi.fn()
      connector.on('disconnect', listener)
      await connector.disconnect()
      expect(listener).toHaveBeenCalled()
    })
  })

  describe('getAccountAddresses', () => {
    it('should return addresses with correct purposes', async () => {
      const addresses = await connector.getAccountAddresses()

      expect(addresses).toHaveLength(2)
      expect(addresses[0]).toEqual({
        address: 'bc1qmock_payment_address',
        publicKey: undefined,
        path: "m/84'/0'/0'/0/0",
        purpose: 'payment'
      })
      expect(addresses[1]).toEqual({
        address: 'bc1qmock_ordinal_address',
        publicKey: undefined,
        path: "m/84'/0'/0'/0/1",
        purpose: 'ordinal'
      })
    })
  })

  describe('signMessage', () => {
    it('should sign a message with ecdsa', async () => {
      await connector.connect()
      const signature = await connector.signMessage({
        address: 'bc1qmock_payment_address',
        message: 'test message',
        protocol: 'ecdsa'
      })

      expect(signature).toBe('mock_signature')
    })

    it('should sign a message without protocol (defaults to ecdsa)', async () => {
      await connector.connect()
      const signature = await connector.signMessage({
        address: 'bc1qmock_payment_address',
        message: 'test message'
      })

      expect(signature).toBe('mock_signature')
    })

    it('should throw error for bip322 protocol', async () => {
      await connector.connect()
      await expect(
        connector.signMessage({
          address: 'bc1qmock_payment_address',
          message: 'test message',
          protocol: 'bip322'
        })
      ).rejects.toThrow(MethodNotSupportedError)
    })
  })

  describe('sendTransfer', () => {
    it('should send a transfer', async () => {
      await connector.connect()
      const txid = await connector.sendTransfer({
        amount: '100000',
        recipient: 'bc1qrecipient'
      })

      expect(txid).toBe('mock_txid')
    })
  })

  describe('switchNetwork', () => {
    it('should switch to testnet', async () => {
      const listener = vi.fn()
      connector.on('chainChanged', listener)

      await connector.switchNetwork(bitcoinTestnet.caipNetworkId)

      expect(listener).toHaveBeenCalledWith(bitcoinTestnet.caipNetworkId)
    })

    it('should switch to mainnet', async () => {
      const listener = vi.fn()
      connector.on('chainChanged', listener)

      await connector.switchNetwork(bitcoin.caipNetworkId)

      expect(listener).toHaveBeenCalledWith(bitcoin.caipNetworkId)
    })
  })

  describe('request', () => {
    it('should throw MethodNotSupportedError', async () => {
      await expect(connector.request({ method: 'test' })).rejects.toThrow(MethodNotSupportedError)
    })
  })

  describe('getWallet', () => {
    it('should return undefined if not client', () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(false)

      const result = TrezorConnector.getWallet({
        requestedChains: [bitcoin, bitcoinTestnet]
      })

      expect(result).toBeUndefined()
    })

    it('should return TrezorConnector instance in browser', () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

      const result = TrezorConnector.getWallet({
        requestedChains: [bitcoin, bitcoinTestnet]
      })

      expect(result).toBeInstanceOf(TrezorConnector)
    })
  })
})
