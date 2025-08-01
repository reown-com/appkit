import { type Address, BitcoinNetworkType } from 'sats-connect'
import {
  type Mock,
  type MockedFunction,
  type MockedObject,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import { WcHelpersUtil } from '@reown/appkit'
import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  type ConnectionControllerClient,
  type NetworkControllerClient,
  StorageUtil
} from '@reown/appkit-controllers'
import { bitcoin, bitcoinTestnet, mainnet } from '@reown/appkit/networks'

import { BitcoinAdapter, type BitcoinConnector } from '../src'
import { BitcoinWalletConnectConnector } from '../src/connectors/BitcoinWalletConnectConnector'
import { LeatherConnector } from '../src/connectors/LeatherConnector'
import { OKXConnector } from '../src/connectors/OKXConnector'
import { SatsConnectConnector } from '../src/connectors/SatsConnectConnector'
import { WalletStandardConnector } from '../src/connectors/WalletStandardConnector'
import type { BitcoinApi } from '../src/utils/BitcoinApi'
import { AddressPurpose } from '../src/utils/BitcoinConnector'
import { mockSatsConnectProvider } from './mocks/mockSatsConnect'
import { mockUTXO } from './mocks/mockUTXO'
import { mockUniversalProvider } from './mocks/mockUniversalProvider'

function mockBitcoinApi(): { [K in keyof BitcoinApi.Interface]: Mock<BitcoinApi.Interface[K]> } {
  return {
    getUTXOs: vi.fn(async () => [])
  }
}

const mockGetActiveNetworks = vi.fn(() => {
  const requestedCaipNetworks = ChainController.getRequestedCaipNetworks(
    ConstantsUtil.CHAIN.BITCOIN
  )

  return requestedCaipNetworks?.[0]
})

describe('BitcoinAdapter', () => {
  let adapter: BitcoinAdapter
  let api: ReturnType<typeof mockBitcoinApi>

  beforeEach(() => {
    api = mockBitcoinApi()
    adapter = new BitcoinAdapter({ api, networks: [bitcoin] })
    ChainController.initialize([adapter], [bitcoin], {
      connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient,
      networkControllerClient: vi.fn() as unknown as NetworkControllerClient
    })
    ChainController.setRequestedCaipNetworks([bitcoin], 'bip122')
  })

  describe('constructor', () => {
    it('should set adapterType', () => {
      expect(adapter.adapterType).toEqual(ConstantsUtil.ADAPTER_TYPES.BITCOIN)
    })

    it('should set namespace', () => {
      expect(adapter.namespace).toEqual(ConstantsUtil.CHAIN.BITCOIN)
    })
  })

  describe('connectWalletConnect', () => {
    let mockWalletConnect: MockedObject<BitcoinWalletConnectConnector>

    beforeEach(() => {
      mockWalletConnect = vi.mocked(
        new BitcoinWalletConnectConnector({
          provider: mockUniversalProvider(),
          chains: [bitcoin],
          getActiveChain: () => bitcoin
        })
      )
      adapter.connectors.push(mockWalletConnect)
    })

    it('should call connect from WALLET_CONNECT connector', async () => {
      await adapter.connectWalletConnect()

      expect(mockWalletConnect.provider.connect).toHaveBeenCalled()
    })

    it('should throw if caipNetworks is not defined', async () => {
      adapter = new BitcoinAdapter({ api })
      await expect(adapter.connectWalletConnect()).rejects.toThrow()
    })

    it('should set BitcoinWalletConnectConnector', async () => {
      await adapter.setUniversalProvider(mockUniversalProvider())
      expect(adapter.connectors[0]).toBeInstanceOf(BitcoinWalletConnectConnector)
      expect(adapter.connectors[0]?.chains).toEqual([])
    })
  })

  describe('connect', () => {
    it('should return the chainId of the available chain from connector', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: mockGetActiveNetworks
      })
      vi.spyOn(connector, 'connect').mockResolvedValueOnce('mock_address')

      adapter.connectors.push(connector)

      const result = await adapter.connect({
        id: connector.id,
        chainId: 'bitcoin:any_chain_id',
        provider: connector.provider,
        type: 'mock_type'
      })

      expect(result).toEqual({
        id: connector.id,
        type: connector.type,
        address: 'mock_address',
        chainId: bitcoin.id,
        provider: connector.provider
      })
    })

    it('should throw if connector is not found', async () => {
      await expect(adapter.connect({ id: 'invalid_id', type: 'invalid_type' })).rejects.toThrow()
    })

    it('should throw if chain is not found', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: mockGetActiveNetworks
      })
      vi.spyOn(connector, 'connect').mockResolvedValueOnce('mock_address')
      vi.spyOn(connector, 'chains', 'get').mockReturnValue([])

      adapter.connectors.push(connector)

      await expect(
        adapter.connect({ id: connector.id, type: connector.type, chainId: 'invalid_chain_id' })
      ).rejects.toThrow()
    })
  })

  describe('getAccounts', () => {
    let connector: BitcoinConnector

    beforeEach(() => {
      connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: mockGetActiveNetworks
      })

      adapter.connectors.push(connector)
    })

    it('should return the accounts', async () => {
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValueOnce([
        {
          address: 'mock_address_1',
          purpose: AddressPurpose.Payment,
          publicKey: 'mock_public_key_1',
          path: 'mock_path_1'
        },
        {
          address: 'mock_address_2',
          purpose: AddressPurpose.Ordinal,
          publicKey: 'mock_public_key_2',
          path: 'mock_path_2'
        },
        {
          address: 'mock_address_3',
          purpose: AddressPurpose.Stacks,
          publicKey: 'mock_public_key_3',
          path: 'mock_path_3'
        }
      ])

      const accounts = await adapter.getAccounts({ id: connector.id })

      accounts.accounts.forEach(account => {
        expect(account.namespace).toEqual(ConstantsUtil.CHAIN.BITCOIN)
        expect(account.publicKey).toBeDefined()
        expect(account.path).toBeDefined()
      })
    })

    it('should return empty accounts if no addresses', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: mockGetActiveNetworks
      })
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValueOnce([])

      adapter.connectors.push(connector)

      const accounts = await adapter.getAccounts({ id: connector.id })

      expect(accounts).toEqual({ accounts: [] })
    })

    it('should return empty accounts if connector is not found', async () => {
      const accounts = await adapter.getAccounts({ id: 'invalid_id' })

      expect(accounts).toEqual({ accounts: [] })
    })

    it('should return empty accounts if connector.getAccountsAddresses throws', async () => {
      vi.spyOn(connector, 'getAccountAddresses').mockRejectedValueOnce(new Error('mock_error'))

      const accounts = await adapter.getAccounts({ id: connector.id })

      expect(accounts).toEqual({ accounts: [] })
    })

    it('should attach payment type if purpose is not found', async () => {
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValueOnce([
        { address: 'mock_address' } as any
      ])

      const accounts = await adapter.getAccounts({ id: connector.id })

      expect(accounts).toEqual({
        accounts: [{ address: 'mock_address', type: 'payment', namespace: 'bip122' }]
      })
    })
  })

  describe('syncConnectors', () => {
    it('should get wallets from all the available connectors', async () => {
      const walletStandardConnectorSpy = vi.spyOn(WalletStandardConnector, 'watchWallets')
      const satsConnectConnectorSpy = vi.spyOn(SatsConnectConnector, 'getWallets')
      const okxConnectorSpy = vi.spyOn(OKXConnector, 'getWallet')

      await adapter.syncConnectors(undefined, undefined)

      expect(walletStandardConnectorSpy).toHaveBeenCalled()
      expect(satsConnectConnectorSpy).toHaveBeenCalled()
      expect(okxConnectorSpy).toHaveBeenCalled()
    })

    it('should add connectors from SatsConnectConnector', async () => {
      mockSatsConnectProvider()
      await adapter.syncConnectors(undefined, undefined)

      expect(adapter.connectors).toHaveLength(1)
      expect(adapter.connectors[0]).toBeInstanceOf(SatsConnectConnector)
    })

    it('should map LeatherConnector', async () => {
      mockSatsConnectProvider({ id: LeatherConnector.ProviderId, name: 'Leather' })
      await adapter.syncConnectors(undefined, undefined)

      expect(adapter.connectors[1]).toBeInstanceOf(LeatherConnector)
    })

    it('should add OKXConnector', async () => {
      ;(window as any).okxwallet = { bitcoin: { connect: vi.fn() } }

      await adapter.syncConnectors(undefined, undefined)

      expect(adapter.connectors[0]).toBeInstanceOf(OKXConnector)
    })

    it('should pass correct getActiveNetwork to SatsConnectConnector', async () => {
      const mocks = mockSatsConnectProvider({ id: LeatherConnector.ProviderId, name: 'Leather' })
      const getRequestedCaipNetworksSpy = vi.spyOn(ChainController, 'getRequestedCaipNetworks')
      await adapter.syncConnectors(undefined, { getCaipNetwork: mockGetActiveNetworks } as any)

      vi.spyOn(mocks.wallet, 'request').mockResolvedValueOnce(
        mockSatsConnectProvider.mockRequestResolve({ hex: 'mock_hex', txid: 'mock_txid' })
      )

      const connector = adapter.connectors.find(
        c => c instanceof LeatherConnector
      ) as LeatherConnector

      connector.signPSBT({ psbt: 'mock_psbt', signInputs: [] })

      expect(mockGetActiveNetworks).toHaveBeenCalled()
      expect(getRequestedCaipNetworksSpy).toHaveBeenCalledWith(ConstantsUtil.CHAIN.BITCOIN)
    })
  })

  describe('syncConnection', () => {
    it('should forward the call to connect', async () => {
      const connectSpy = vi.spyOn(adapter, 'connect').mockResolvedValueOnce({
        id: 'mock_id',
        type: 'ANNOUNCED',
        address: 'mock_address',
        chainId: 'mock_chain_id',
        provider: undefined
      })

      await adapter.syncConnection({
        id: 'mock_id',
        chainId: 'mock_chain_id',
        namespace: 'bip122',
        rpcUrl: 'mock_rpc_url'
      })

      expect(connectSpy).toHaveBeenCalledWith({ id: 'mock_id', chainId: 'mock_chain_id', type: '' })
    })
  })

  describe('getBalance', () => {
    it('should return the balance', async () => {
      api.getUTXOs.mockResolvedValueOnce([
        mockUTXO({ value: 10000 }),
        mockUTXO({ value: 20000 }),
        mockUTXO({ value: 30000 }),
        mockUTXO({ value: 10000000000 })
      ])

      const balance = await adapter.getBalance({
        address: 'mock_address',
        chainId: bitcoin.id,
        caipNetwork: bitcoin
      })

      expect(balance).toEqual({
        balance: '100.0006',
        symbol: 'BTC'
      })
      StorageUtil.clearAddressCache()
    })

    it('should call getBalance once even when multiple adapter requests are sent at the same time', async () => {
      // delay the response to simulate http request latency
      const latency = 1000
      const numSimultaneousRequests = 10
      const expectedSentRequests = 1

      api.getUTXOs.mockResolvedValue(
        new Promise(resolve => {
          setTimeout(() => {
            resolve([
              mockUTXO({ value: 10000 }),
              mockUTXO({ value: 20000 }),
              mockUTXO({ value: 30000 }),
              mockUTXO({ value: 10000000000 })
            ])
          }, latency)
        }) as any
      )

      const result = await Promise.all([
        ...Array.from({ length: numSimultaneousRequests }).map(() =>
          adapter.getBalance({
            address: 'mock_address',
            chainId: bitcoin.id,
            caipNetwork: bitcoin
          })
        )
      ])

      expect(api.getUTXOs).toHaveBeenCalledTimes(expectedSentRequests)
      expect(result.length).toBe(numSimultaneousRequests)
      expect(expectedSentRequests).to.be.lt(numSimultaneousRequests)

      // verify all calls got the same balance
      for (const balance of result) {
        expect(balance).toEqual({
          balance: '100.0006',
          symbol: 'BTC'
        })
      }

      StorageUtil.clearAddressCache()
    })

    it('should return empty balance if no UTXOs', async () => {
      api.getUTXOs.mockResolvedValueOnce([])

      const balance = await adapter.getBalance({
        address: 'mock_address',
        chainId: bitcoin.id,
        caipNetwork: bitcoin
      })

      expect(balance).toEqual({
        balance: '0',
        symbol: 'BTC'
      })
    })

    it('should return empty balance if chain is not bip122', async () => {
      const balance = await adapter.getBalance({
        address: 'mock_address',
        chainId: mainnet.id,
        caipNetwork: mainnet as any
      })

      expect(balance).toEqual({
        balance: '0',
        symbol: bitcoin.nativeCurrency.symbol
      })
    })

    it('should return empty balance if chain is not provided', async () => {
      const balance = await adapter.getBalance({
        address: 'mock_address',
        chainId: 'mock_chain_id'
      })

      expect(balance).toEqual({
        balance: '0',
        symbol: bitcoin.nativeCurrency.symbol
      })
    })
  })

  describe('signMessage', async () => {
    let connector: BitcoinConnector

    beforeEach(() => {
      connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: mockGetActiveNetworks
      })
    })

    it('should return the signature', async () => {
      vi.spyOn(connector, 'signMessage').mockResolvedValueOnce('mock_signature')

      const result = await adapter.signMessage({
        message: 'mock_message',
        address: 'mock_address',
        provider: connector.provider
      })

      expect(result).toEqual({ signature: 'mock_signature' })
    })

    it('should throw if connector is not found', async () => {
      await expect(
        adapter.signMessage({
          address: 'mock_address',
          message: 'mock_message',
          provider: undefined
        })
      ).rejects.toThrow()
    })
  })

  describe('getWalletConnectProvider', () => {
    it('should return the wallet connect provider', () => {
      const provider = adapter.getWalletConnectProvider({
        activeCaipNetwork: bitcoin,
        caipNetworks: [bitcoin],
        provider: undefined
      })

      expect(provider).toBeInstanceOf(BitcoinWalletConnectConnector)
    })
  })

  describe('disconnect', () => {
    it('should disconnect using param provider', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: mockGetActiveNetworks
      })
      vi.spyOn(connector, 'disconnect')

      adapter.connectors.push(connector)

      await adapter.disconnect({ id: connector.id })

      expect(connector.disconnect).toHaveBeenCalled()
    })

    it('should disconnect using connector from class', async () => {
      const mocks = mockSatsConnectProvider()
      const connector = new SatsConnectConnector({
        provider: mocks.provider,
        requestedChains: [bitcoin],
        getActiveNetwork: mockGetActiveNetworks
      })
      vi.spyOn(connector, 'disconnect')
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValueOnce([
        { address: 'mock_address', purpose: AddressPurpose.Payment }
      ])

      adapter.connectors.push(connector)

      await adapter.connect({ id: connector.id, chainId: bitcoin.id, type: '' })
      await adapter.disconnect({ id: connector.id })

      expect(connector.disconnect).toHaveBeenCalled()
    })

    it('should disconnect all connectors if no connector id provided and return them as connections', async () => {
      const connector1 = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })
      const connector2 = new SatsConnectConnector({
        provider: mockSatsConnectProvider({ id: 'provider2', name: 'Provider2' }).provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      const disconnect1Spy = vi.spyOn(connector1, 'disconnect').mockResolvedValue(undefined)
      const disconnect2Spy = vi.spyOn(connector2, 'disconnect').mockResolvedValue(undefined)

      adapter.connectors.push(connector1, connector2)
      ;(adapter as any).addConnection({
        connectorId: connector1.id,
        accounts: [{ address: 'address1' }],
        caipNetwork: bitcoin
      })
      ;(adapter as any).addConnection({
        connectorId: connector2.id,
        accounts: [{ address: 'address2' }],
        caipNetwork: bitcoin
      })

      const result = await adapter.disconnect({ id: undefined })

      expect(disconnect1Spy).toHaveBeenCalled()
      expect(disconnect2Spy).toHaveBeenCalled()
      expect(result.connections).toHaveLength(2)

      const connectorIds = result.connections.map(c => c.connectorId)
      expect(connectorIds).toContain(connector1.id)
      expect(connectorIds).toContain(connector2.id)
    })

    it('should handle empty connections', async () => {
      const result = await adapter.disconnect({ id: undefined })

      expect(result.connections).toHaveLength(0)
    })

    it('should throw error if one of the connector is not found from connections', async () => {
      ;(adapter as any).addConnection({
        connectorId: 'non-existent-connector',
        accounts: [{ address: 'address1' }],
        caipNetwork: bitcoin
      })

      await expect(adapter.disconnect({ id: undefined })).rejects.toThrow('Connector not found')
    })

    it('should throw error if one of the connector fails to disconnect', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      const disconnectSpy = vi
        .spyOn(connector, 'disconnect')
        .mockRejectedValue(new Error('Disconnect failed'))
      adapter.connectors.push(connector)
      ;(adapter as any).addConnection({
        connectorId: connector.id,
        accounts: [{ address: 'address1' }],
        caipNetwork: bitcoin
      })

      await expect(adapter.disconnect({ id: undefined })).rejects.toThrow('Disconnect failed')
      expect(disconnectSpy).toHaveBeenCalled()
    })
  })

  describe('connector events', () => {
    let mocks: ReturnType<typeof mockSatsConnectProvider>
    const listeners = {
      accountChanged: vi.fn(),
      disconnect: vi.fn(),
      switchNetwork: vi.fn(),
      chainChanged: vi.fn(),
      connections: vi.fn()
    }

    beforeEach(async () => {
      const getCaipNetwork = vi.fn(() => bitcoin)

      mocks = mockSatsConnectProvider()
      await adapter.syncConnectors(undefined, { getCaipNetwork } as any)

      vi.spyOn(mocks.wallet, 'request').mockResolvedValue(
        mockSatsConnectProvider.mockRequestResolve({
          addresses: [
            {
              address: 'mock_address',
              type: 'mock_type',
              publicKey: 'mock_public_key'
            }
          ] as unknown as Address[],
          id: 'mock_id',
          network: {
            name: 'Bitcoin',
            stacks: { name: BitcoinNetworkType.Mainnet },
            bitcoin: { name: BitcoinNetworkType.Mainnet }
          }
        })
      )

      listeners.accountChanged = vi.fn()
      adapter.on('accountChanged', listeners.accountChanged)
      listeners.disconnect = vi.fn()
      adapter.on('disconnect', listeners.disconnect)
      listeners.switchNetwork = vi.fn()
      adapter.on('switchNetwork', listeners.switchNetwork)
      listeners.connections = vi.fn()
      adapter.on('connections', listeners.connections)

      await adapter.connect({
        id: mocks.provider.name,
        chainId: bitcoin.id,
        type: ''
      })
    })

    it('should have bound events', () => {
      expect(mocks.wallet.addListener).toHaveBeenCalledWith('accountChange', expect.any(Function))
      expect(mocks.wallet.addListener).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(mocks.wallet.addListener).toHaveBeenCalledWith('networkChange', expect.any(Function))
    })

    it('should emit accountsChanged on accountChange', async () => {
      const callback = mocks.wallet.addListener.mock.calls.find(
        ([name]) => name === 'accountChange'
      )![1]

      await callback({ type: 'accountChange' })

      expect(listeners.accountChanged).toHaveBeenCalled()
    })

    it('should emit disconnect on disconnect', () => {
      const callback = mocks.wallet.addListener.mock.calls.find(
        ([name]) => name === 'disconnect'
      )![1]

      callback({ type: 'disconnect' })

      expect(listeners.disconnect).toHaveBeenCalled()
    })

    it('should add connection when connect is called', async () => {
      expect(listeners.connections).toHaveBeenCalledWith([
        expect.objectContaining({
          connectorId: mocks.provider.name,
          accounts: [
            {
              address: 'mock_address',
              type: 'payment',
              publicKey: 'mock_public_key'
            }
          ],
          caipNetwork: bitcoin
        })
      ])
    })
  })

  describe('switchNetwork', () => {
    it('should execute switch network for SatsConnectConnector', async () => {
      const provider = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: mockGetActiveNetworks
      })

      const switchNetworkSpy = vi.spyOn(provider, 'switchNetwork').mockResolvedValue(undefined)

      await adapter.switchNetwork({
        caipNetwork: bitcoinTestnet,
        provider,
        providerType: provider.type
      })

      expect(switchNetworkSpy).toHaveBeenCalledWith(bitcoinTestnet.caipNetworkId)
    })

    it('should execute switch network for XverseConnector', async () => {
      // Create XverseConnector mock
      const xverseMocks = mockSatsConnectProvider({
        id: 'XverseProvider',
        name: 'Xverse'
      })

      const xverseConnector = new SatsConnectConnector({
        provider: xverseMocks.provider,
        requestedChains: [bitcoin, bitcoinTestnet],
        getActiveNetwork: mockGetActiveNetworks
      })

      const switchNetworkSpy = vi
        .spyOn(xverseConnector, 'switchNetwork')
        .mockResolvedValue(undefined)

      await adapter.switchNetwork({
        caipNetwork: bitcoinTestnet,
        provider: xverseConnector,
        providerType: xverseConnector.type
      })

      expect(switchNetworkSpy).toHaveBeenCalledWith(bitcoinTestnet.caipNetworkId)
    })

    it('should execute switch network for WalletConnectConnector', async () => {
      const provider = mockUniversalProvider()
      const setDefaultChainSpy = provider.setDefaultChain as MockedFunction<
        typeof provider.setDefaultChain
      >

      await adapter.switchNetwork({
        caipNetwork: bitcoinTestnet,
        provider,
        providerType: 'WALLET_CONNECT'
      })

      expect(setDefaultChainSpy).toHaveBeenCalledWith(bitcoinTestnet.caipNetworkId)
    })

    it('should propagate errors from connector switchNetwork', async () => {
      const provider = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: mockGetActiveNetworks
      })

      const error = new Error('Network switching failed')
      vi.spyOn(provider, 'switchNetwork').mockRejectedValue(error)

      await expect(
        adapter.switchNetwork({
          caipNetwork: bitcoinTestnet,
          provider,
          providerType: provider.type
        })
      ).rejects.toThrow('Network switching failed')
    })
  })

  describe('syncConnections', () => {
    let mockGetConnectorStorageInfo: Mock
    let mockEmitFirstAvailableConnection: any

    beforeEach(() => {
      mockGetConnectorStorageInfo = vi.fn()
      mockEmitFirstAvailableConnection = vi
        .spyOn(adapter as any, 'emitFirstAvailableConnection')
        .mockImplementation(() => {})
    })

    it('should sync connections for connectors that have connected and are not disconnected', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      const getAccountAddressesSpy = vi
        .spyOn(connector, 'getAccountAddresses')
        .mockResolvedValue([{ address: 'mock_address', purpose: AddressPurpose.Payment }])

      const connectSpy = vi.spyOn(connector, 'connect').mockResolvedValue('mock_address')
      const listenProviderEventsSpy = vi
        .spyOn(adapter as any, 'listenProviderEvents')
        .mockImplementation(() => {})

      adapter.connectors.push(connector)

      mockGetConnectorStorageInfo.mockReturnValue({
        isDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: bitcoin,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(connectSpy).toHaveBeenCalled()
      expect(getAccountAddressesSpy).toHaveBeenCalledWith()
      expect(listenProviderEventsSpy).toHaveBeenCalledWith(connector.id, connector.provider)
      expect(adapter.connections).toHaveLength(1)
      expect(adapter.connections[0]?.connectorId).toBe(connector.id)
    })

    it('should skip connectors that are disconnected', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      const connectSpy = vi.spyOn(connector, 'connect')
      adapter.connectors.push(connector)

      mockGetConnectorStorageInfo.mockReturnValue({
        isDisconnected: true,
        hasConnected: false
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: bitcoin,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(connectSpy).not.toHaveBeenCalled()
      expect(adapter.connections).toHaveLength(0)
    })

    it('should skip connectors that have never connected', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      const connectSpy = vi.spyOn(connector, 'connect')
      adapter.connectors.push(connector)

      mockGetConnectorStorageInfo.mockReturnValue({
        isDisconnected: false,
        hasConnected: false
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: bitcoin,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(connectSpy).not.toHaveBeenCalled()
      expect(adapter.connections).toHaveLength(0)
    })

    it('should handle WalletConnect connector specially', async () => {
      const mockWcProvider = mockUniversalProvider()
      adapter.setUniversalProvider(mockWcProvider)

      const wcConnector = adapter.connectors.find(c => c.id === 'walletConnect')

      expect(wcConnector).toBeDefined()

      const mockAccounts = [
        {
          address: 'wc_address',
          chainId: bitcoin.id,
          chainNamespace: ConstantsUtil.CHAIN.BITCOIN as any
        }
      ]
      vi.spyOn(WcHelpersUtil, 'getWalletConnectAccounts').mockReturnValue(mockAccounts)

      mockGetConnectorStorageInfo.mockReturnValue({
        isDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: bitcoin,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      const wcConnection = adapter.connections.find(c => c.connectorId === 'walletConnect')
      expect(WcHelpersUtil.getWalletConnectAccounts).toHaveBeenCalledWith(mockWcProvider, 'bip122')
      expect(wcConnection).toBeDefined()
    })

    it('should call emitFirstAvailableConnection when connectToFirstConnector is true', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      vi.spyOn(connector, 'connect').mockResolvedValue('mock_address')
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValue([
        { address: 'mock_address', purpose: AddressPurpose.Payment }
      ])

      adapter.connectors.push(connector)

      mockGetConnectorStorageInfo.mockReturnValue({
        isDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: true,
        caipNetwork: bitcoin,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(mockEmitFirstAvailableConnection).toHaveBeenCalled()
    })

    it('should not call emitFirstAvailableConnection when connectToFirstConnector is false', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      vi.spyOn(connector, 'connect').mockResolvedValue('mock_address')
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValue([
        { address: 'mock_address', purpose: AddressPurpose.Payment }
      ])

      adapter.connectors.push(connector)

      mockGetConnectorStorageInfo.mockReturnValue({
        isDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: bitcoin,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(mockEmitFirstAvailableConnection).not.toHaveBeenCalled()
    })

    it('should handle connector connection failures', async () => {
      const connector1 = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })
      const connector2 = new SatsConnectConnector({
        provider: mockSatsConnectProvider({ id: 'provider2', name: 'Provider2' }).provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      vi.spyOn(connector1, 'connect').mockRejectedValue(new Error('Connection failed'))
      vi.spyOn(connector2, 'connect').mockResolvedValue('mock_address_2')
      vi.spyOn(connector2, 'getAccountAddresses').mockResolvedValue([
        { address: 'mock_address_2', purpose: AddressPurpose.Payment }
      ])

      adapter.connectors.push(connector1, connector2)

      mockGetConnectorStorageInfo.mockReturnValue({
        isDisconnected: false,
        hasConnected: true
      })

      await expect(
        adapter.syncConnections({
          connectToFirstConnector: false,
          caipNetwork: bitcoin,
          getConnectorStorageInfo: mockGetConnectorStorageInfo
        })
      ).rejects.toThrow('Connection failed')

      expect(adapter.connections).toHaveLength(1)
      expect(adapter.connections[0]?.connectorId).toBe(connector2.id)
    })

    it('should throw error if connector does not support requested chain', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      vi.spyOn(connector, 'connect').mockResolvedValue('mock_address')
      vi.spyOn(connector, 'chains', 'get').mockReturnValue([])
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValue([
        { address: 'mock_address', purpose: AddressPurpose.Payment }
      ])

      adapter.connectors.push(connector)

      mockGetConnectorStorageInfo.mockReturnValue({
        isDisconnected: false,
        hasConnected: true
      })

      await expect(
        adapter.syncConnections({
          connectToFirstConnector: false,
          caipNetwork: bitcoin,
          getConnectorStorageInfo: mockGetConnectorStorageInfo
        })
      ).rejects.toThrow('The connector does not support any of the requested chains')

      expect(adapter.connections).toHaveLength(0)
    })

    it('should not add connection if connector.connect returns falsy address', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      vi.spyOn(connector, 'connect').mockResolvedValue('')
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValue([
        { address: 'mock_address', purpose: AddressPurpose.Payment }
      ])
      adapter.connectors.push(connector)

      mockGetConnectorStorageInfo.mockReturnValue({
        isDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: bitcoin,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(adapter.connections).toHaveLength(0)
    })
  })

  it('should not throw for not used methods', async () => {
    expect(await adapter.estimateGas({} as any)).toEqual({})
    expect(await adapter.sendTransaction({} as any)).toEqual({})
    expect(await adapter.writeContract({} as any)).toEqual({})
    expect(adapter.parseUnits({} as any)).toEqual(BigInt(0))
    expect(adapter.formatUnits({} as any)).toEqual('')
    expect(await adapter.grantPermissions({})).toEqual({})
    expect(await adapter.getCapabilities({} as any)).toEqual({})
    expect(await adapter.revokePermissions({} as any)).toEqual('0x')
  })
})
