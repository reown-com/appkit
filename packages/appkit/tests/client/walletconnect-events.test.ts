import { beforeAll, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  StorageUtil
} from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mainnet, sepolia } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('WalletConnect Events', () => {
  beforeAll(() => {
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
  })

  describe('chainChanged', () => {
    it('should call setUnsupportedNetwork', async () => {
      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()
      const setUnsupportedNetworkSpy = vi.spyOn(appkit as any, 'setUnsupportedNetwork')
      const chainChangedCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'chainChanged'
      )?.[1]

      if (!chainChangedCallback) {
        throw new Error('chainChanged callback not found')
      }

      chainChangedCallback('unknown_chain_id')

      expect(setUnsupportedNetworkSpy).toHaveBeenCalledWith('unknown_chain_id')
    })

    it('should call setCaipNetwork', async () => {
      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      const chainChangedCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'chainChanged'
      )?.[1]

      if (!chainChangedCallback) {
        throw new Error('chainChanged callback not found')
      }

      chainChangedCallback(sepolia.id)
      expect(setActiveCaipNetwork).toHaveBeenCalledWith(sepolia)

      chainChangedCallback(mainnet.id.toString())
      expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
    })
  })

  describe('display_uri', () => {
    it('should call openUri', () => {
      new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })

      const setUriSpy = vi.spyOn(ConnectionController, 'setUri')
      const displayUriCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'display_uri'
      )?.[1]

      if (!displayUriCallback) {
        throw new Error('display_uri callback not found')
      }

      displayUriCallback('mock_uri')
      expect(setUriSpy).toHaveBeenCalledWith('mock_uri')
    })
  })

  describe('connect', () => {
    it('should call finalizeWcConnection once connected', async () => {
      vi.spyOn(CoreHelperUtil, 'getAccount').mockReturnValueOnce({
        address: '0x123',
        chainId: '1'
      })
      const finalizeWcConnectionSpy = vi
        .spyOn(ConnectionController, 'finalizeWcConnection')
        .mockReturnValueOnce()
      mockUniversalProvider.on.mockClear()

      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()

      const connectCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'connect'
      )?.[1]

      if (!connectCallback) {
        throw new Error('connect callback not found')
      }

      connectCallback()

      expect(finalizeWcConnectionSpy).toHaveBeenCalledWith('0x123')
    })

    it('should call StorageUtil.removeDisconnectedConnectorId for all namespaces after onConnect', async () => {
      vi.spyOn(CoreHelperUtil, 'getAccount').mockReturnValueOnce({
        address: '0x123',
        chainId: '1'
      })

      vi.spyOn(ConnectionController, 'finalizeWcConnection').mockReturnValueOnce()

      const removeDisconnectedConnectorIdSpy = vi
        .spyOn(StorageUtil, 'removeDisconnectedConnectorId')
        .mockImplementation(() => {})

      mockUniversalProvider.on.mockClear()

      const appkit = new AppKit({
        ...mockOptions,
        universalProvider: mockUniversalProvider as any
      })

      await appkit.ready()

      const connectCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'connect'
      )?.[1]

      if (!connectCallback) {
        throw new Error('connect callback not found')
      }

      connectCallback()

      expect(removeDisconnectedConnectorIdSpy).toHaveBeenCalledWith(
        ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT,
        'eip155'
      )
      expect(removeDisconnectedConnectorIdSpy).toHaveBeenCalledWith(
        ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT,
        'solana'
      )
      expect(removeDisconnectedConnectorIdSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('sessions created by Universal Provider', () => {
    const address = '0x1234567890123456789012345678901234567890'
    const session = {
      namespaces: { eip155: { accounts: [`eip155:1:${address}`] } },
      peer: { metadata: { name: 'Mock Wallet', description: '', url: '', icons: [] } }
    }

    function getHandler(provider: { on: ReturnType<typeof vi.fn> }, event: string) {
      const handler = provider.on.mock.calls.filter(([name]) => name === event).at(-1)?.[1]
      if (!handler) {
        throw new Error(`${event} handler not found`)
      }

      return handler as () => void
    }

    async function createAppKit(universalProvider: object, adapters = mockOptions.adapters) {
      const appkit = new AppKit({
        ...mockOptions,
        adapters,
        universalProvider: universalProvider as any
      })
      await appkit.ready()

      return appkit
    }

    function mockConnectorIds(connectorIds: Record<string, string | undefined>) {
      return vi
        .spyOn(ConnectorController, 'getConnectorId')
        .mockImplementation(namespace => connectorIds[namespace as string])
    }

    it('adopts a session connected outside AppKit, once, without taking over other wallets', async () => {
      const provider = { ...mockUniversalProvider, on: vi.fn(), session }
      const appkit = await createAppKit(provider)
      const syncSpy = vi
        .spyOn(appkit as any, 'syncWalletConnectAccount')
        .mockResolvedValue(undefined)
      // EVM has no connection yet, Solana is connected to another wallet
      const getConnectorIdSpy = mockConnectorIds({ solana: 'phantom' })

      getHandler(provider, 'connect')()
      const isConnectingSpy = vi
        .spyOn(ConnectionController, 'isWalletConnectConnecting')
        .mockReturnValue(true)
      getHandler(provider, 'connect')()

      expect(syncSpy).toHaveBeenCalledOnce()
      expect(syncSpy).toHaveBeenCalledWith(['eip155'])
      isConnectingSpy.mockRestore()
      getConnectorIdSpy.mockRestore()
    })

    it('reflects the session in AppKit state', async () => {
      const provider = { ...mockUniversalProvider, on: vi.fn(), session: undefined as unknown }
      const appkit = await createAppKit(provider, [])
      vi.spyOn(appkit as any, 'syncBalance').mockResolvedValue(undefined)
      expect(appkit.getCaipAddress('eip155')).toBeUndefined()

      // Universal Provider settles a session that AppKit didn't request
      provider.session = session
      getHandler(provider, 'connect')()

      await vi.waitFor(() => expect(appkit.getCaipAddress('eip155')).toBe(`eip155:1:${address}`))
      expect(ConnectorController.getConnectorId('eip155')).toBe(
        ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
      )
    })

    it('re-syncs on session_update only the namespaces on WalletConnect', async () => {
      const provider = { ...mockUniversalProvider, on: vi.fn(), session }
      const appkit = await createAppKit(provider)
      const syncSpy = vi
        .spyOn(appkit as any, 'syncWalletConnectAccount')
        .mockResolvedValue(undefined)
      const getConnectorIdSpy = mockConnectorIds({ eip155: 'injected' })

      getHandler(provider, 'session_update')()
      expect(syncSpy).not.toHaveBeenCalled()

      // EVM through WalletConnect, Solana through another wallet
      getConnectorIdSpy.mockRestore()
      const multiWalletSpy = mockConnectorIds({
        eip155: ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT,
        solana: 'phantom'
      })
      getHandler(provider, 'session_update')()
      expect(syncSpy).toHaveBeenCalledOnce()
      expect(syncSpy).toHaveBeenCalledWith(['eip155'])
      multiWalletSpy.mockRestore()
    })

    it('restores a session that AppKit has no stored connector for', async () => {
      const provider = { ...mockUniversalProvider, on: vi.fn(), session }
      const appkit = await createAppKit(provider)
      const getConnectorIdSpy = vi
        .spyOn(ConnectorController, 'getConnectorId')
        .mockReturnValue(undefined)
      const reconnectSpy = vi
        .spyOn(appkit as any, 'reconnectWalletConnect')
        .mockResolvedValue(undefined)

      await (appkit as any).syncNamespaceConnection('eip155')
      await (appkit as any).syncNamespaceConnection('solana')

      // Only this namespace, so it can't override a connector restored for another one
      expect(reconnectSpy).toHaveBeenCalledOnce()
      expect(reconnectSpy).toHaveBeenCalledWith(['eip155'])
      getConnectorIdSpy.mockRestore()
    })
  })

  describe('finalizeWcConnection', () => {
    it('should not send CONNECT_SUCCESS event when called without address', () => {
      const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')

      // Call finalizeWcConnection without address
      ConnectionController.finalizeWcConnection()

      // Verify that EventsController.sendEvent was not called with CONNECT_SUCCESS
      const connectSuccessCalls = sendEventSpy.mock.calls.filter(
        ([event]) => event?.event === 'CONNECT_SUCCESS'
      )
      expect(connectSuccessCalls).toHaveLength(0)

      sendEventSpy.mockRestore()
    })

    it('should send CONNECT_SUCCESS event when called with address', () => {
      const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')

      // Call finalizeWcConnection with address
      ConnectionController.finalizeWcConnection('0x123')

      // Verify that EventsController.sendEvent was called with CONNECT_SUCCESS
      const connectSuccessCalls = sendEventSpy.mock.calls.filter(
        ([event]) => event?.event === 'CONNECT_SUCCESS'
      )
      expect(connectSuccessCalls).toHaveLength(1)
      expect(connectSuccessCalls[0]![0]).toMatchObject({
        type: 'track',
        event: 'CONNECT_SUCCESS',
        address: '0x123'
      })

      sendEventSpy.mockRestore()
    })
  })
})
