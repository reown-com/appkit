import { BitcoinNetworkType } from 'sats-connect'
import type { AddressPurpose, AddressType } from 'sats-connect'
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { LeatherConnector } from '../../src/connectors/LeatherConnector'
import { SatsConnectConnector } from '../../src/connectors/SatsConnectConnector'
import { mockSatsConnectProvider } from '../mocks/mockSatsConnect'

describe('LeatherConnector', () => {
  let satsConnectConnector: SatsConnectConnector
  let connector: LeatherConnector
  let mocks: ReturnType<typeof mockSatsConnectProvider>
  let requestedChains: CaipNetwork[]
  let getActiveNetwork: Mock<() => CaipNetwork | undefined>

  beforeEach(() => {
    requestedChains = []
    getActiveNetwork = vi.fn(() => bitcoin)
    mocks = mockSatsConnectProvider({ id: 'LeatherProvider' })
    satsConnectConnector = new SatsConnectConnector({
      provider: mocks.provider,
      requestedChains,
      getActiveNetwork
    })
    connector = new LeatherConnector({ connector: satsConnectConnector })
  })

  it('should throw an error if the wallet is not a LeatherProvider', () => {
    mocks = mockSatsConnectProvider({ id: 'NotLeatherProvider' })
    satsConnectConnector = new SatsConnectConnector({
      provider: mocks.provider,
      requestedChains,
      getActiveNetwork
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
    expect(requestSpy).toHaveBeenCalledWith('sendTransfer', { address: 'address', amount: '100' })
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
    getActiveNetwork.mockReturnValueOnce(bitcoinTestnet)

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
    getActiveNetwork.mockReturnValueOnce(undefined)

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
})
