import {
  AddressPurpose,
  AddressType,
  BitcoinNetworkType,
  MessageSigningProtocols
} from 'sats-connect'
import { type Mock, type MockInstance, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { CoreHelperUtil } from '@reown/appkit-controllers'
import { bitcoin, bitcoinTestnet, mainnet } from '@reown/appkit/networks'

import { SatsConnectConnector } from '../../src/connectors/SatsConnectConnector'
import { mockSatsConnectProvider } from '../mocks/mockSatsConnect'

describe('SatsConnectConnector', () => {
  let connector: SatsConnectConnector
  let mocks: ReturnType<typeof mockSatsConnectProvider>
  let requestedChains: CaipNetwork[]
  let getActiveNetwork: Mock<() => CaipNetwork | undefined>

  beforeEach(() => {
    // requested chains may contain not bip122 chains
    requestedChains = [
      { ...mainnet, caipNetworkId: 'eip155:1', chainNamespace: 'eip155' },
      bitcoin,
      bitcoinTestnet
    ]
    mocks = mockSatsConnectProvider()
    getActiveNetwork = vi.fn(() => bitcoin)
    connector = new SatsConnectConnector({
      provider: mocks.provider,
      requestedChains,
      getActiveNetwork
    })
  })

  it('should validate the test fixture', async () => {
    expect((window as any)[mocks.provider.id]).toBeDefined()
    expect(window.btc_providers).to.include(mocks.provider)
    expect(connector).toBeDefined()
  })

  it('should get wallets correctly', async () => {
    const wallets = SatsConnectConnector.getWallets({ requestedChains, getActiveNetwork })

    expect(wallets instanceof Array).toBeTruthy()
    wallets.forEach(wallet => expect(wallet instanceof SatsConnectConnector).toBeTruthy())
  })

  it('should return an empty array when window is undefined (server-side)', () => {
    vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(false)

    const wallets = SatsConnectConnector.getWallets({
      requestedChains: [],
      getActiveNetwork: () => undefined
    })

    expect(wallets).toEqual([])
  })

  it('should get metadata correctly', async () => {
    expect(connector.id).toBe(mocks.provider.name)
    expect(connector.name).toBe(mocks.provider.name)
    expect(connector.imageUrl).toBe(mocks.provider.icon)
    expect(connector.chains).toEqual([bitcoin, bitcoinTestnet])
  })

  it('should disconnect correctly', async () => {
    await connector.disconnect()
    expect(mocks.wallet.request).toHaveBeenCalledWith('wallet_disconnect', null)
  })

  it('should request correctly', async () => {
    const args = { method: 'getAddresses', params: {} }
    await connector.request(args)
    expect(mocks.wallet.request).toHaveBeenCalledWith(args.method, args.params)
  })

  it('should connect correctly with wallet already connected', async () => {
    const spy = vi.spyOn(mocks.wallet, 'request')

    spy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestResolve({
        addresses: [
          {
            address: 'mock_address',
            purpose: 'payment' as AddressPurpose,
            addressType: 'p2pkh' as AddressType,
            gaiaAppKey: 'mock_gaia_app_key',
            gaiaHubUrl: 'mock_gaia_hub_url',
            publicKey: 'mock_public_key',
            walletType: 'software' // Add walletType
          }
        ],
        network: {
          name: 'Bitcoin',
          stacks: { name: BitcoinNetworkType.Mainnet },
          bitcoin: { name: BitcoinNetworkType.Mainnet }
        },
        walletType: 'software'
      })
    )

    const result = await connector.connect()

    expect(result).toBe('mock_address')
    expect(mocks.wallet.request).toHaveBeenCalledWith('getAddresses', {
      purposes: expect.arrayContaining(['payment', 'ordinals', 'stacks']),
      message: 'Connect to your wallet'
    })
  })

  it('should connect correctly with wallet not connected', async () => {
    const emitSpy = vi.spyOn(connector, 'emit')
    const spy = vi.spyOn(mocks.wallet, 'request')

    spy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestReject({ message: 'Unauthorized' })
    )

    spy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestResolve({
        addresses: [
          {
            address: 'mock_address',
            purpose: 'payment' as AddressPurpose,
            addressType: 'p2pkh' as AddressType,
            gaiaAppKey: 'mock_gaia_app_key',
            gaiaHubUrl: 'mock_gaia_hub_url',
            publicKey: 'mock_public_key',
            walletType: 'software'
          }
        ],
        network: {
          name: 'Bitcoin',
          stacks: { name: BitcoinNetworkType.Mainnet },
          bitcoin: { name: BitcoinNetworkType.Mainnet }
        },
        walletType: 'software'
      })
    )

    const result = await connector.connect()

    expect(emitSpy).toHaveBeenCalledWith('accountsChanged', ['mock_address'])
    expect(result).toBe('mock_address')
    expect(mocks.wallet.request).toHaveBeenNthCalledWith(1, 'getAddresses', {
      purposes: expect.arrayContaining(['payment', 'ordinals', 'stacks']),
      message: 'Connect to your wallet'
    })
    expect(mocks.wallet.request).toHaveBeenNthCalledWith(2, 'wallet_connect', null)
  })

  it('should throw if connect with empty addresses', async () => {
    const spy = vi.spyOn(mocks.wallet, 'request')

    spy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestResolve({
        addresses: [],
        walletType: 'software',
        id: 'mock_id',
        network: {
          name: 'Bitcoin',
          stacks: { name: BitcoinNetworkType.Mainnet },
          bitcoin: { name: BitcoinNetworkType.Mainnet }
        }
      })
    )

    await expect(connector.connect()).rejects.toThrow('No address available')
  })

  it('should signMessage correctly', async () => {
    const params = { message: 'mock_message', address: 'mock_address' }
    const spy = vi.spyOn(mocks.wallet, 'request')

    spy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestResolve({
        signature: 'mock_signature',
        address: 'mock_address',
        protocol: MessageSigningProtocols.BIP322,
        messageHash: 'mock_message_hash'
      })
    )

    const result = await connector.signMessage(params)

    expect(result).toBe('mock_signature')
    expect(mocks.wallet.request).toHaveBeenCalledWith('signMessage', params)
  })

  it('should signMessage with ecdsa protocol correctly', async () => {
    const params = {
      message: 'mock_message',
      address: 'mock_address',
      protocol: 'ecdsa' as const
    }
    const spy = vi.spyOn(mocks.wallet, 'request')

    spy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestResolve({
        signature: 'mock_signature',
        address: 'mock_address',
        protocol: MessageSigningProtocols.ECDSA,
        messageHash: 'mock_message_hash'
      })
    )

    const result = await connector.signMessage(params)

    expect(result).toBe('mock_signature')
    expect(mocks.wallet.request).toHaveBeenCalledWith('signMessage', {
      ...params,
      protocol: MessageSigningProtocols.ECDSA
    })
  })

  it('should signMessage with bip322 protocol correctly', async () => {
    const params = {
      message: 'mock_message',
      address: 'mock_address',
      protocol: 'bip322' as const
    }
    const spy = vi.spyOn(mocks.wallet, 'request')

    spy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestResolve({
        signature: 'mock_signature',
        address: 'mock_address',
        protocol: MessageSigningProtocols.BIP322,
        messageHash: 'mock_message_hash'
      })
    )

    const result = await connector.signMessage(params)

    expect(result).toBe('mock_signature')
    expect(mocks.wallet.request).toHaveBeenCalledWith('signMessage', {
      ...params,
      protocol: MessageSigningProtocols.BIP322
    })
  })

  it('should sendTransfer correctly', async () => {
    const params = {
      amount: '1000',
      recipient: 'mock_recipient'
    }
    const spy = vi.spyOn(mocks.wallet, 'request')

    spy.mockResolvedValueOnce(mockSatsConnectProvider.mockRequestResolve({ txid: 'mock_txid' }))

    const result = await connector.sendTransfer(params)

    expect(result).toBe('mock_txid')
    expect(mocks.wallet.request).toHaveBeenCalledWith('sendTransfer', {
      recipients: [{ address: params.recipient, amount: 1000 }]
    })
  })

  it('should signPSBT correctly', async () => {
    const params = {
      psbt: 'mock_psbt',
      broadcast: true,
      signInputs: [{ address: 'mock_address', index: 0, sighashTypes: [0] }]
    }
    const spy = vi.spyOn(mocks.wallet, 'request')

    spy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestResolve({ psbt: 'mock_signed_psbt' })
    )

    const result = await connector.signPSBT(params)

    expect(result).toEqual({ psbt: 'mock_signed_psbt' })
    expect(mocks.wallet.request).toHaveBeenCalledWith('signPsbt', {
      psbt: params.psbt,
      broadcast: params.broadcast,
      signInputs: { mock_address: [0] }
    })
  })

  it('should throw if sendTransfer with invalid amount', async () => {
    const params = {
      amount: 'invalid',
      recipient: 'mock_recipient'
    }

    await expect(connector.sendTransfer(params)).rejects.toThrow('Invalid amount')
  })

  it('should throw correct error if internalRequest fails', async () => {
    const args = {
      method: 'signMessage',
      params: { message: 'mock_message', address: 'mock_address' }
    }
    vi.spyOn(mocks.wallet, 'request').mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestReject({
        message: 'mock_error'
      })
    )

    await expect(connector.request(args)).rejects.toThrow('mock_error')

    vi.spyOn(mocks.wallet, 'request').mockRejectedValueOnce(
      mockSatsConnectProvider.mockRequestReject({
        message: 'mock_error'
      })
    )

    await expect(connector.request(args)).rejects.toThrow('mock_error')

    vi.spyOn(mocks.wallet, 'request').mockRejectedValueOnce(new Error('unknown_error'))

    await expect(connector.request(args)).rejects.toThrow('unknown_error')
  })

  it('should throw if wallet_disconnect request fails', async () => {
    vi.spyOn(mocks.wallet, 'request').mockRejectedValueOnce(
      mockSatsConnectProvider.mockRequestReject({
        message: 'mock_error'
      })
    )

    await expect(connector.disconnect()).rejects.toThrow('mock_error')
  })

  it('should not add events if wallet provider does not support events', async () => {
    ;(mocks.wallet as any).addListener = undefined

    vi.spyOn(mocks.wallet, 'request').mockResolvedValue(
      mockSatsConnectProvider.mockRequestResolve({
        addresses: [
          {
            address: 'mock_address',
            purpose: 'payment' as AddressPurpose,
            addressType: 'p2pkh' as AddressType,
            gaiaAppKey: 'mock_gaia_app_key',
            gaiaHubUrl: 'mock_gaia_hub_url',
            publicKey: 'mock_public_key',
            walletType: 'software'
          }
        ],
        network: {
          name: 'Bitcoin',
          stacks: { name: BitcoinNetworkType.Mainnet },
          bitcoin: { name: BitcoinNetworkType.Mainnet }
        },
        walletType: 'software'
      })
    )

    await expect(connector.connect()).resolves.not.toThrow()
  })

  describe('events after connection', () => {
    let addListenerSpy: MockInstance<typeof mocks.wallet.addListener>
    const addListenerCallbackMock = vi.fn(() => {})

    beforeEach(async () => {
      // connect wallet first
      vi.spyOn(mocks.wallet, 'request').mockResolvedValue(
        mockSatsConnectProvider.mockRequestResolve({
          id: 'mock_id',
          addresses: [
            {
              address: 'mock_address',
              purpose: 'payment' as AddressPurpose,
              addressType: 'p2pkh' as AddressType,
              gaiaAppKey: 'mock_gaia_app_key',
              gaiaHubUrl: 'mock_gaia_hub_url',
              publicKey: 'mock_public_key',
              walletType: 'software'
            }
          ],
          network: {
            name: 'Bitcoin',
            stacks: { name: BitcoinNetworkType.Mainnet },
            bitcoin: { name: BitcoinNetworkType.Mainnet }
          },
          walletType: 'software'
        })
      )

      addListenerSpy = vi.spyOn(mocks.wallet, 'addListener')
      addListenerSpy.mockReturnValue(addListenerCallbackMock)

      await connector.connect()
    })

    it('should have bound events after connection', async () => {
      expect(addListenerSpy).toHaveBeenCalledWith('accountChange', expect.any(Function))
      expect(addListenerSpy).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(addListenerSpy).toHaveBeenCalledWith('networkChange', expect.any(Function))
    })

    it('should unbind events after disconnect', async () => {
      await connector.disconnect()

      expect(addListenerCallbackMock).toHaveBeenCalledTimes(3)
    })

    it('should execute the callback on accountChange event', async () => {
      const connectSpy = vi.spyOn(connector, 'connect')
      const emitSpy = vi.spyOn(connector, 'emit')
      const callback = addListenerSpy.mock.calls.find(([event]) => event === 'accountChange')?.[1]

      await callback?.({ type: 'accountChange' })

      expect(connectSpy).toHaveBeenCalled()
      expect(emitSpy).toHaveBeenCalledWith('accountsChanged', ['mock_address'])
    })

    it('should execute the callback on disconnect event', async () => {
      const emitSpy = vi.spyOn(connector, 'emit')
      const callback = addListenerSpy.mock.calls.find(([event]) => event === 'disconnect')?.[1]

      await callback?.({ type: 'disconnect' })

      expect(emitSpy).toHaveBeenCalledWith('disconnect')
    })

    it('should execute the callback on networkChange event', async () => {
      const emitSpy = vi.spyOn(connector, 'emit')
      const callback = addListenerSpy.mock.calls.find(([event]) => event === 'networkChange')?.[1]

      await callback?.({
        type: 'networkChange',
        stacks: { name: BitcoinNetworkType.Mainnet },
        bitcoin: { name: BitcoinNetworkType.Mainnet }
      })

      expect(emitSpy).toHaveBeenCalledWith('chainChanged', bitcoin.caipNetworkId)
    })
  })
})
