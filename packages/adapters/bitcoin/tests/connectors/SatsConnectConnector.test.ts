import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SatsConnectConnector } from '../../src/connectors/SatsConnectConnector'
import { mockSatsConnectProvider } from '../mocks/mockSatsConnect'
import type { CaipNetwork } from '@reown/appkit-common'
import { MessageSigningProtocols } from 'sats-connect'

describe('SatsConnectConnector', () => {
  let connector: SatsConnectConnector
  let mocks: ReturnType<typeof mockSatsConnectProvider>
  let requestedChains: CaipNetwork[]

  beforeEach(() => {
    requestedChains = []
    mocks = mockSatsConnectProvider()
    connector = new SatsConnectConnector({ provider: mocks.provider, requestedChains })
  })

  it('should validate the test fixture', async () => {
    expect((window as any)[mocks.provider.id]).toBeDefined()
    expect(window.btc_providers).to.include(mocks.provider)
    expect(connector).toBeDefined()
  })

  it('should get wallets correctly', async () => {
    const wallets = SatsConnectConnector.getWallets({ requestedChains })

    expect(wallets instanceof Array).toBeTruthy()
    wallets.forEach(wallet => expect(wallet instanceof SatsConnectConnector).toBeTruthy())
  })

  it('should get metadata correctly', async () => {
    expect(connector.id).toBe(mocks.provider.name)
    expect(connector.name).toBe(mocks.provider.name)
    expect(connector.imageUrl).toBe(mocks.provider.icon)
    expect(connector.chains).toEqual(requestedChains)
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
            purpose: 'receive',
            addressType: 'p2pkh',
            gaiaAppKey: 'mock_gaia_app_key',
            gaiaHubUrl: 'mock_gaia_hub_url',
            publicKey: 'mock_public_key'
          }
        ]
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
    const spy = vi.spyOn(mocks.wallet, 'request')

    spy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestReject({ message: 'Unauthorized' })
    )

    spy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestResolve({
        addresses: [
          {
            address: 'mock_address',
            purpose: 'payment',
            addressType: 'p2pkh',
            gaiaAppKey: 'mock_gaia_app_key',
            gaiaHubUrl: 'mock_gaia_hub_url',
            publicKey: 'mock_public_key'
          }
        ]
      })
    )

    const result = await connector.connect()

    expect(result).toBe('mock_address')
    expect(mocks.wallet.request).toHaveBeenNthCalledWith(1, 'getAddresses', {
      purposes: expect.arrayContaining(['payment', 'ordinals', 'stacks']),
      message: 'Connect to your wallet'
    })
    expect(mocks.wallet.request).toHaveBeenNthCalledWith(2, 'wallet_connect', null)
  })

  it('should throw if connect with empty addresses', async () => {
    const spy = vi.spyOn(mocks.wallet, 'request')

    spy.mockResolvedValueOnce(mockSatsConnectProvider.mockRequestResolve({ addresses: [] }))

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
  })
})
