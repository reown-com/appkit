import {
  type MockedFunction,
  type MockedObject,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  type ConnectionControllerClient,
  ProviderController,
  WcHelpersUtil
} from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'
import { ton, tonTestnet } from '@reown/appkit/networks'

import { TonAdapter } from '../src/adapter'
import { TonConnectConnector } from '../src/connectors/TonConnectConnector.js'
import { TonWalletConnectConnector } from '../src/connectors/TonWalletConnectConnector.js'
import { TonConnectUtil } from '../src/utils/TonConnectUtil.js'
import { mockTonProvider } from '../tests/mocks/mockTonProvider.js'
import { mockUniversalProvider } from '../tests/mocks/mockUniversalProvider.js'

describe('TonAdapter', () => {
  let adapter: TonAdapter

  beforeEach(() => {
    adapter = new TonAdapter({ networks: [tonTestnet] })
    ChainController.initialize([adapter], [tonTestnet], {
      connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient
    })
    ChainController.setRequestedCaipNetworks([tonTestnet], 'ton')
  })

  describe('constructor', () => {
    it('should set adapterType', () => {
      expect(adapter.adapterType).toEqual(ConstantsUtil.ADAPTER_TYPES.TON)
    })

    it('should set namespace', () => {
      expect(adapter.namespace).toEqual(ConstantsUtil.CHAIN.TON)
    })
  })

  describe('connectWalletConnect', () => {
    let mockWalletConnect: MockedObject<TonWalletConnectConnector>

    beforeEach(() => {
      mockWalletConnect = vi.mocked(
        new TonWalletConnectConnector({
          provider: mockUniversalProvider(),
          chains: [tonTestnet]
        })
      )
      adapter.connectors.push(mockWalletConnect)
    })

    it('should call connect from WALLET_CONNECT connector', async () => {
      await adapter.connectWalletConnect()

      expect(mockWalletConnect.provider.connect).toHaveBeenCalled()
    })

    it('should throw if caipNetworks is not defined', async () => {
      adapter = new TonAdapter({})
      await expect(adapter.connectWalletConnect()).rejects.toThrow()
    })

    it('should set TonWalletConnectConnector', async () => {
      await adapter.setUniversalProvider(mockUniversalProvider())
      expect(adapter.connectors[0]).toBeInstanceOf(TonWalletConnectConnector)
      expect(adapter.connectors[0]?.chains).toEqual([])
    })
  })

  describe('connect', () => {
    it('should return the chainId of the available chain from connector', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })
      vi.spyOn(connector, 'connect').mockResolvedValueOnce('mock_ton_address')

      adapter.connectors.push(connector)

      const result = await adapter.connect({
        id: connector.id,
        chainId: 'ton:any_chain_id',
        type: 'INJECTED'
      })

      expect(result).toEqual({
        id: connector.id,
        type: connector.type,
        address: 'mock_ton_address',
        chainId: tonTestnet.id,
        provider: connector
      })
    })

    it('should throw if connector is not found', async () => {
      await expect(adapter.connect({ id: 'invalid_id', type: 'invalid_type' })).rejects.toThrow(
        'Connector not found'
      )
    })

    it('should throw if chain is not found', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })
      vi.spyOn(connector, 'connect').mockResolvedValueOnce('mock_ton_address')
      vi.spyOn(connector, 'chains', 'get').mockReturnValue([])

      adapter.connectors.push(connector)

      await expect(
        adapter.connect({ id: connector.id, type: connector.type, chainId: 'invalid_chain_id' })
      ).rejects.toThrow('The connector does not support any of the requested chains')
    })

    it('should emit accountChanged event', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })
      vi.spyOn(connector, 'connect').mockResolvedValueOnce('mock_ton_address')

      adapter.connectors.push(connector)

      const accountChangedSpy = vi.fn()
      adapter.on('accountChanged', accountChangedSpy)

      await adapter.connect({
        id: connector.id,
        chainId: tonTestnet.id,
        type: 'INJECTED'
      })

      expect(accountChangedSpy).toHaveBeenCalledWith({
        address: 'mock_ton_address',
        chainId: tonTestnet.id,
        connector
      })
    })
  })

  describe('getAccounts', () => {
    it('should return empty accounts (TON uses single address model)', async () => {
      const accounts = await adapter.getAccounts()

      expect(accounts).toEqual({ accounts: [] })
    })
  })

  describe('syncConnectors', () => {
    it('should get wallets from injected providers', async () => {
      vi.spyOn(TonConnectUtil, 'fetchWalletsListDTO').mockResolvedValueOnce([
        {
          app_name: 'tonkeeper',
          name: 'Tonkeeper',
          image: 'https://config.ton.org/assets/tonkeeper.png',
          tondns: 'tonkeeper.ton',
          about_url: 'https://tonkeeper.com',
          universal_url: 'https://app.tonkeeper.com/ton-connect',
          deepLink: 'tonkeeper-tc://',
          bridge: [
            { type: 'sse', url: 'https://bridge.tonapi.io/bridge' },
            { type: 'js', key: 'tonkeeper' }
          ],
          platforms: ['ios', 'android', 'chrome', 'firefox', 'macos', 'windows', 'linux'],
          features: [
            {
              name: 'SendTransaction',
              maxMessages: 255,
              extraCurrencySupported: true
            },
            { name: 'SignData', types: ['text', 'binary', 'cell'] }
          ]
        }
      ])

      // Mock global.window.tonkeeper
      ;(global as any).window = {
        tonkeeper: {
          tonconnect: {
            connect: vi.fn(),
            walletInfo: {
              name: 'Tonkeeper',
              appName: 'tonkeeper',
              imageUrl: 'data:image/png;base64,test',
              aboutUrl: 'https://tonkeeper.com',
              platforms: ['chrome'],
              jsBridgeKey: 'tonkeeper',
              injected: true,
              embedded: false
            }
          }
        }
      }

      await adapter.syncConnectors()

      expect(adapter.connectors.length).toBeGreaterThan(0)

      // Cleanup
      delete (global as any).window
    })
  })

  describe('syncConnection', () => {
    it('should forward the call to connect', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })

      adapter.connectors.push(connector)

      const connectSpy = vi.spyOn(adapter, 'connect').mockResolvedValueOnce({
        id: connector.id,
        type: 'INJECTED',
        address: 'mock_ton_address',
        chainId: tonTestnet.id,
        provider: undefined
      })

      await adapter.syncConnection({
        id: connector.id,
        chainId: tonTestnet.id,
        namespace: 'ton',
        rpcUrl: 'mock_rpc_url'
      })

      expect(connectSpy).toHaveBeenCalledWith({
        id: connector.id,
        chainId: tonTestnet.id,
        type: 'INJECTED'
      })
    })
  })

  describe('getBalance', () => {
    it('should return balance as expected', async () => {
      vi.spyOn(
        (await import('@reown/appkit-controllers')).BlockchainApiController,
        'getAddressBalance'
      ).mockResolvedValueOnce('10000000000')

      const balance = await adapter.getBalance({
        address: 'EQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        chainId: '-239',
        caipNetwork: ton
      })

      expect(balance).toEqual({
        balance: '10',
        symbol: 'TON'
      })
    })

    it('should return empty balance if no address', async () => {
      const balance = await adapter.getBalance({
        address: '',
        chainId: '-239'
      })

      expect(balance).toEqual({
        balance: '0',
        symbol: 'TON'
      })
    })

    it('should return empty balance if no chainId', async () => {
      const balance = await adapter.getBalance({
        address: 'EQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        chainId: ''
      })

      expect(balance).toEqual({
        balance: '0',
        symbol: 'TON'
      })
    })
  })

  describe('signMessage', () => {
    it('should return empty signature (TON uses signData instead)', async () => {
      const result = await adapter.signMessage()

      expect(result).toEqual({ signature: '' })
    })
  })

  describe('sendTransaction', () => {
    it('should return empty hash (TON uses sendMessage instead)', async () => {
      const result = await adapter.sendTransaction()

      expect(result).toEqual({ hash: '' })
    })
  })

  describe('getWalletConnectProvider', () => {
    it('should return the wallet connect provider', () => {
      const provider = adapter.getWalletConnectProvider({
        activeCaipNetwork: tonTestnet,
        caipNetworks: [tonTestnet],
        provider: mockUniversalProvider()
      })

      expect(provider).toBeInstanceOf(TonWalletConnectConnector)
    })
  })

  describe('disconnect', () => {
    it('should disconnect using param id', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })
      vi.spyOn(connector, 'disconnect')

      adapter.connectors.push(connector)

      await adapter.disconnect({ id: connector.id })

      expect(connector.disconnect).toHaveBeenCalled()
    })

    it('should disconnect using connector from class', async () => {
      const mocks = mockTonProvider()
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })
      vi.spyOn(connector, 'disconnect')
      vi.spyOn(connector, 'connect').mockResolvedValueOnce('mock_address')

      adapter.connectors.push(connector)

      await adapter.connect({ id: connector.id, chainId: tonTestnet.id, type: 'INJECTED' })
      await adapter.disconnect({ id: connector.id })

      expect(connector.disconnect).toHaveBeenCalled()
    })

    it('should throw if connector is not found', async () => {
      await expect(adapter.disconnect({ id: 'non-existent' })).rejects.toThrow(
        'TonAdapter:disconnect - connector not found'
      )
    })

    it('should disconnect all connectors if no connector id provided', async () => {
      const connector1 = new TonConnectConnector({
        wallet: mockTonProvider({ name: 'Tonkeeper' }).wallet,
        chains: [tonTestnet]
      })
      const connector2 = new TonConnectConnector({
        wallet: mockTonProvider({ name: 'MyTonWallet' }).wallet,
        chains: [tonTestnet]
      })

      const disconnect1Spy = vi.spyOn(connector1, 'disconnect').mockResolvedValue(undefined)
      const disconnect2Spy = vi.spyOn(connector2, 'disconnect').mockResolvedValue(undefined)

      adapter.connectors.push(connector1, connector2)
      ;(adapter as any).addConnection({
        connectorId: connector1.id,
        accounts: [{ address: 'address1', type: 'eoa' }],
        caipNetwork: tonTestnet
      })
      ;(adapter as any).addConnection({
        connectorId: connector2.id,
        accounts: [{ address: 'address2', type: 'eoa' }],
        caipNetwork: tonTestnet
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

    it('should throw error if connector fails to disconnect', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })

      vi.spyOn(connector, 'disconnect').mockRejectedValue(new Error('Disconnect failed'))
      adapter.connectors.push(connector)
      ;(adapter as any).addConnection({
        connectorId: connector.id,
        accounts: [{ address: 'address1', type: 'eoa' }],
        caipNetwork: tonTestnet
      })

      // Should not throw, just log error
      const result = await adapter.disconnect({ id: connector.id })

      expect(result.connections).toHaveLength(1)
    })
  })

  describe('connector events', () => {
    let mocks: ReturnType<typeof mockTonProvider>
    const listeners = {
      accountChanged: vi.fn(),
      disconnect: vi.fn(),
      switchNetwork: vi.fn(),
      connections: vi.fn()
    }

    beforeEach(async () => {
      vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(tonTestnet)

      mocks = mockTonProvider()

      // Create connector
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })

      vi.spyOn(connector, 'connect').mockResolvedValue('mock_ton_address')

      adapter.connectors.push(connector)

      listeners.accountChanged = vi.fn()
      adapter.on('accountChanged', listeners.accountChanged)
      listeners.disconnect = vi.fn()
      adapter.on('disconnect', listeners.disconnect)
      listeners.switchNetwork = vi.fn()
      adapter.on('switchNetwork', listeners.switchNetwork)
      listeners.connections = vi.fn()
      adapter.on('connections', listeners.connections)

      await adapter.connect({
        id: connector.id,
        chainId: tonTestnet.id,
        type: 'INJECTED'
      })
    })

    it('should add connection when connect is called', async () => {
      expect(listeners.connections).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            connectorId: expect.any(String),
            accounts: expect.arrayContaining([
              expect.objectContaining({
                address: 'mock_ton_address',
                type: 'eoa'
              })
            ]),
            caipNetwork: tonTestnet
          })
        ])
      )
    })
  })

  describe('switchNetwork', () => {
    it('should execute switch network for TonConnectConnector', async () => {
      const provider = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet, ton]
      })

      ProviderController.setProvider(ton.chainNamespace, provider)
      ProviderController.setProviderId(ton.chainNamespace, provider.type)

      const switchNetworkSpy = vi.spyOn(provider, 'switchNetwork').mockResolvedValue(undefined)

      await adapter.switchNetwork({
        caipNetwork: ton
      })

      expect(switchNetworkSpy).toHaveBeenCalledWith(ton.caipNetworkId)
    })

    it('should execute switch network for WalletConnectConnector', async () => {
      const provider = mockUniversalProvider()
      const setDefaultChainSpy = provider.setDefaultChain as MockedFunction<
        typeof provider.setDefaultChain
      >

      ProviderController.setProvider(ton.chainNamespace, provider)
      ProviderController.setProviderId(ton.chainNamespace, 'WALLET_CONNECT')

      await adapter.switchNetwork({
        caipNetwork: ton
      })

      expect(setDefaultChainSpy).toHaveBeenCalledWith(ton.caipNetworkId)
    })

    it('should propagate errors from connector switchNetwork', async () => {
      const provider = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })

      ProviderController.setProvider(ton.chainNamespace, provider)
      ProviderController.setProviderId(ton.chainNamespace, provider.type)

      const error = new Error('Network switching failed')
      vi.spyOn(provider, 'switchNetwork').mockRejectedValue(error)

      await expect(
        adapter.switchNetwork({
          caipNetwork: ton
        })
      ).rejects.toThrow('Network switching failed')
    })
  })

  describe('syncConnections', () => {
    let mockEmitFirstAvailableConnection: any

    beforeEach(() => {
      mockEmitFirstAvailableConnection = vi
        .spyOn(adapter as any, 'emitFirstAvailableConnection')
        .mockImplementation(() => {})
    })

    it('should sync connections for connectors that have connected and are not disconnected', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })

      const connectSpy = vi.spyOn(connector, 'connect').mockResolvedValue('mock_ton_address')
      const listenProviderEventsSpy = vi
        .spyOn(adapter as any, 'listenProviderEvents')
        .mockImplementation(() => {})

      adapter.connectors.push(connector)

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: tonTestnet
      })

      expect(connectSpy).toHaveBeenCalled()
      expect(listenProviderEventsSpy).toHaveBeenCalledWith(connector.id, connector)
      expect(adapter.connections).toHaveLength(1)
      expect(adapter.connections[0]?.connectorId).toBe(connector.id)
    })

    it('should skip connectors that are disconnected', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })

      const connectSpy = vi.spyOn(connector, 'connect')
      adapter.connectors.push(connector)

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValue({
        hasDisconnected: true,
        hasConnected: false
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: tonTestnet
      })

      expect(connectSpy).not.toHaveBeenCalled()
      expect(adapter.connections).toHaveLength(0)
    })

    it('should skip connectors that have never connected', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })

      const connectSpy = vi.spyOn(connector, 'connect')
      adapter.connectors.push(connector)

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValue({
        hasDisconnected: false,
        hasConnected: false
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: tonTestnet
      })

      expect(connectSpy).not.toHaveBeenCalled()
      expect(adapter.connections).toHaveLength(0)
    })

    it('should handle WalletConnect connector specially', async () => {
      const mockWcProvider = mockUniversalProvider()
      await adapter.setUniversalProvider(mockWcProvider)

      const wcConnector = adapter.connectors.find(c => c.id === 'walletConnect')

      expect(wcConnector).toBeDefined()

      const mockAccounts = [
        {
          address: 'wc_ton_address',
          chainId: tonTestnet.id,
          chainNamespace: ConstantsUtil.CHAIN.TON as any
        }
      ]
      vi.spyOn(WcHelpersUtil, 'getWalletConnectAccounts').mockReturnValue(mockAccounts)

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: tonTestnet
      })

      const wcConnection = adapter.connections.find(c => c.connectorId === 'walletConnect')
      expect(WcHelpersUtil.getWalletConnectAccounts).toHaveBeenCalledWith(mockWcProvider, 'ton')
      expect(wcConnection).toBeDefined()
    })

    it('should call emitFirstAvailableConnection when connectToFirstConnector is true', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })

      vi.spyOn(connector, 'connect').mockResolvedValue('mock_ton_address')

      adapter.connectors.push(connector)

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValueOnce({
        hasDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: true,
        caipNetwork: tonTestnet
      })

      expect(mockEmitFirstAvailableConnection).toHaveBeenCalled()
    })

    it('should not call emitFirstAvailableConnection when connectToFirstConnector is false', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })

      vi.spyOn(connector, 'connect').mockResolvedValue('mock_ton_address')

      adapter.connectors.push(connector)

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValueOnce({
        hasDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: tonTestnet
      })

      expect(mockEmitFirstAvailableConnection).not.toHaveBeenCalled()
    })

    it('should not add connection if connector.connect returns empty address', async () => {
      const connector = new TonConnectConnector({
        wallet: mockTonProvider().wallet,
        chains: [tonTestnet]
      })

      vi.spyOn(connector, 'connect').mockResolvedValue('')

      adapter.connectors.push(connector)

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValueOnce({
        hasDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: tonTestnet
      })

      expect(adapter.connections).toHaveLength(0)
    })
  })

  it('should not throw for placeholder methods', async () => {
    expect(await adapter.estimateGas({} as any)).toEqual({ gas: BigInt(0) })
    expect(await adapter.writeContract({} as any)).toEqual({ hash: '' })
    expect(adapter.parseUnits()).toEqual(BigInt(0))
    expect(adapter.formatUnits()).toEqual('')
    expect(await adapter.grantPermissions({})).toEqual({})
    expect(await adapter.getCapabilities({} as any)).toEqual({})
    expect(await adapter.revokePermissions({} as any)).toEqual(
      '0x0000000000000000000000000000000000000000'
    )
    expect(await adapter.walletGetAssets({} as any)).toEqual({})
  })
})
