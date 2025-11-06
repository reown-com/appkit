import { BitcoinNetworkType, MessageSigningProtocols } from 'sats-connect'
import type { AddressPurpose, AddressType } from 'sats-connect'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { LeatherConnector } from '../../src/connectors/LeatherConnector'
import { SatsConnectConnector } from '../../src/connectors/SatsConnectConnector'
import { mockSatsConnectProvider } from '../mocks/mockSatsConnect'

describe('LeatherConnector', () => {
  let satsConnectConnector: SatsConnectConnector
  let connector: LeatherConnector
  let mocks: ReturnType<typeof mockSatsConnectProvider>
  let requestedChains: CaipNetwork[]

  beforeEach(() => {
    requestedChains = []
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(bitcoin)
    mocks = mockSatsConnectProvider({ id: 'LeatherProvider' })
    satsConnectConnector = new SatsConnectConnector({
      provider: mocks.provider,
      requestedChains
    })
    connector = new LeatherConnector({ connector: satsConnectConnector })
  })

  it('should throw an error if the wallet is not a LeatherProvider', () => {
    mocks = mockSatsConnectProvider({ id: 'NotLeatherProvider' })
    satsConnectConnector = new SatsConnectConnector({
      provider: mocks.provider,
      requestedChains
    })
    expect(() => {
      new LeatherConnector({ connector: satsConnectConnector })
    }).toThrowError('LeatherConnector: wallet must be a LeatherProvider')
  })

  it('should create a new instance', () => {
    expect(connector).toBeDefined()
    expect(connector).toBeInstanceOf(LeatherConnector)
    expect(connector).toBeInstanceOf(SatsConnectConnector)
  })

  it('should send a transfer', async () => {
    const txid = 'txid'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(mockSatsConnectProvider.mockRequestResolve({ txid }))

    const res = await connector.sendTransfer({ amount: '100', recipient: 'address' })

    expect(res).toBe(txid)
    expect(requestSpy).toHaveBeenCalledWith('sendTransfer', {
      recipients: [{ address: 'address', amount: '100' }],
      network: 'mainnet'
    })
  })

  it('should send a transfer for testnet', async () => {
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(bitcoinTestnet)

    const txid = 'txid'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(mockSatsConnectProvider.mockRequestResolve({ txid }))

    const res = await connector.sendTransfer({ amount: '100', recipient: 'address' })

    expect(res).toBe(txid)
    expect(requestSpy).toHaveBeenCalledWith('sendTransfer', {
      recipients: [{ address: 'address', amount: '100' }],
      network: 'testnet'
    })
  })

  it('should sign a PSBT', async () => {
    const psbt = 'psbt'
    const txid = 'txid'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(
      mockSatsConnectProvider.mockRequestResolve({ hex: '70736274', txid })
    )

    const res = await connector.signPSBT({ psbt, signInputs: [], broadcast: true })

    expect(res).toEqual({ psbt: 'cHNidA==', txid })
    expect(requestSpy).toHaveBeenCalledWith('signPsbt', {
      hex: 'a6c6ed',
      network: 'mainnet',
      broadcast: true
    })
  })

  it('should sign a PSBT for testnet', async () => {
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(bitcoinTestnet)

    const psbt = 'psbt'
    const txid = 'txid'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(
      mockSatsConnectProvider.mockRequestResolve({ hex: '70736274', txid })
    )

    const res = await connector.signPSBT({ psbt, signInputs: [], broadcast: true })

    expect(res).toEqual({ psbt: 'cHNidA==', txid })
    expect(requestSpy).toHaveBeenCalledWith('signPsbt', {
      hex: 'a6c6ed',
      network: 'testnet',
      broadcast: true
    })
  })

  it('should throw an error if the network is unsupported', async () => {
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(undefined)

    const psbt = 'psbt'
    const txid = 'txid'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(
      mockSatsConnectProvider.mockRequestResolve({ hex: '70736274', txid })
    )

    await expect(
      connector.signPSBT({ psbt, signInputs: [], broadcast: true })
    ).rejects.toThrowError('LeatherConnector: unsupported network')
  })

  it('should sign a PSBT with signInputs without broadcast', async () => {
    const psbt = 'psbt'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(
      // @ts-expect-error - mock response without txid for non-broadcast
      mockSatsConnectProvider.mockRequestResolve({ hex: '70736274', txid: undefined })
    )
    const signInputs = [{ index: 0, address: 'mock_address', sighashTypes: [1, 3] }]
    const res = await connector.signPSBT({ psbt, signInputs, broadcast: false })
    expect(res).toEqual({ psbt: 'cHNidA==', txid: undefined })
    expect(requestSpy).toHaveBeenCalledWith('signPsbt', {
      hex: 'a6c6ed',
      network: 'mainnet',
      broadcast: false,
      signAtIndex: 0,
      allowedSighash: [1, 3]
    })
  })

  it('should sign a PSBT with signInputs with broadcast', async () => {
    const psbt = 'psbt'
    const txid = 'txid'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(
      mockSatsConnectProvider.mockRequestResolve({ hex: '70736274', txid })
    )
    const signInputs = [{ index: 0, address: 'mock_address', sighashTypes: [1, 3] }]
    const res = await connector.signPSBT({ psbt, signInputs, broadcast: true })
    expect(res).toEqual({ psbt: 'cHNidA==', txid })
    expect(requestSpy).toHaveBeenCalledWith('signPsbt', {
      hex: 'a6c6ed',
      network: 'mainnet',
      broadcast: true,
      signAtIndex: 0,
      allowedSighash: [1, 3]
    })
  })

  it('should disconnect', async () => {
    await expect(connector.disconnect()).resolves.not.toThrow()
  })

  it('should keep accounts and reuse if getAccountAddresses is called multiple times', async () => {
    const requestSpy = vi.spyOn(mocks.wallet, 'request')

    requestSpy.mockResolvedValueOnce(
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

    const addressesFirstCall = await connector.getAccountAddresses()
    const addressesSecondCall = await connector.getAccountAddresses()

    expect(requestSpy).toHaveBeenCalledTimes(1)
    expect(addressesFirstCall).toEqual(addressesSecondCall)
  })

  it('should clean up accounts after disconnection', async () => {
    const requestSpy = vi.spyOn(mocks.wallet, 'request')

    requestSpy.mockResolvedValueOnce(
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

    const addressesFirstCall = await connector.getAccountAddresses()
    await connector.disconnect()

    requestSpy.mockResolvedValueOnce(
      mockSatsConnectProvider.mockRequestResolve({
        addresses: [
          {
            address: 'mock_address_2',
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
    const addressesSecondCall = await connector.getAccountAddresses()

    expect(requestSpy).toHaveBeenCalledTimes(2)
    expect(addressesFirstCall).not.toBe(addressesSecondCall)

    requestSpy.mockRestore()
  })

  it('should replace image/svg with image/svg+xml', () => {
    const connector = new LeatherConnector({
      connector: satsConnectConnector
    })

    expect(connector.imageUrl).toBe('data:image/svg+xml;')
  })

  it('should sign a message', async () => {
    const message = 'test message'
    const signature = 'mock_signature'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(
      mockSatsConnectProvider.mockRequestResolve({
        address: 'mock_address',
        protocol: MessageSigningProtocols.ECDSA,
        signature,
        messageHash: 'mock_message_hash'
      })
    )

    const res = await connector.signMessage({ message, address: 'mock_address' })

    expect(res).toBe(signature)
    expect(requestSpy).toHaveBeenCalledWith('signMessage', {
      message,
      address: 'mock_address',
      protocol: undefined,
      network: 'mainnet'
    })
  })

  it('should sign a message with protocol', async () => {
    const message = 'test message'
    const signature = 'mock_signature'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(
      mockSatsConnectProvider.mockRequestResolve({
        address: 'mock_address',
        protocol: MessageSigningProtocols.BIP322,
        signature,
        messageHash: 'mock_message_hash'
      })
    )

    const res = await connector.signMessage({
      message,
      address: 'mock_address',
      protocol: 'bip322'
    })

    expect(res).toBe(signature)
    expect(requestSpy).toHaveBeenCalledWith('signMessage', {
      message,
      address: 'mock_address',
      protocol: 'BIP322',
      network: 'mainnet'
    })
  })

  it('should sign a message for testnet', async () => {
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(bitcoinTestnet)

    const message = 'test message'
    const signature = 'mock_signature'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(
      mockSatsConnectProvider.mockRequestResolve({
        address: 'mock_address',
        protocol: MessageSigningProtocols.ECDSA,
        signature,
        messageHash: 'mock_message_hash'
      })
    )

    const res = await connector.signMessage({ message, address: 'mock_address' })

    expect(res).toBe(signature)
    expect(requestSpy).toHaveBeenCalledWith('signMessage', {
      message,
      address: 'mock_address',
      protocol: undefined,
      network: 'testnet'
    })
  })

  it('should throw an error when signing a message with unsupported network', async () => {
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(undefined)

    const message = 'test message'
    const signature = 'mock_signature'
    const requestSpy = vi.spyOn(mocks.wallet, 'request')
    requestSpy.mockResolvedValue(
      mockSatsConnectProvider.mockRequestResolve({
        address: 'mock_address',
        protocol: MessageSigningProtocols.ECDSA,
        signature,
        messageHash: 'mock_message_hash'
      })
    )

    await expect(connector.signMessage({ message, address: 'mock_address' })).rejects.toThrowError(
      'LeatherConnector: unsupported network'
    )
  })
})
