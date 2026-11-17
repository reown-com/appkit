import UniversalProvider from '@walletconnect/universal-provider'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ApiController,
  ChainController,
  ConnectorController,
  EventsController,
  ModalController,
  StorageUtil
} from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit-core.js'
import { mockEvmAdapter, mockSolanaAdapter } from '../mocks/Adapter.js'
import { mainnet, solana } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import mockProvider from '../mocks/UniversalProvider.js'
import { mockBlockchainApiController, mockWindowAndDocument } from '../test-utils.js'

function createEvmAdapter() {
  return { ...mockEvmAdapter, on: vi.fn() }
}

describe('WalletConnect restore without a session', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockWindowAndDocument()
    localStorage.clear()
    mockBlockchainApiController()
    vi.spyOn(ApiController, 'fetchUsage').mockResolvedValue(undefined)
    vi.spyOn(ApiController, 'prefetch').mockResolvedValue([])
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})
    vi.spyOn(ModalController, 'close')
    ConnectorController.resetConnectorIds()
    ConnectorController.state.allConnectors = []
    ConnectorController.state.connectors = []
    ChainController.state.chains = new Map()
    ChainController.state.noAdapters = false
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it.each([
    { name: 'missing session', session: undefined },
    { name: 'missing namespace', session: { ...mockProvider.session!, namespaces: {} } },
    {
      name: 'empty accounts',
      session: {
        ...mockProvider.session!,
        namespaces: {
          eip155: { ...mockProvider.session!.namespaces['eip155']!, accounts: [] }
        }
      }
    }
  ])('clears a persisted WalletConnect connector with $name', async ({ session }) => {
    StorageUtil.setConnectedConnectorId('eip155', ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)
    StorageUtil.addConnectedNamespace('eip155')
    StorageUtil.setConnectionStatus('connected')

    const appKit = new AppKit({
      ...mockOptions,
      basic: true,
      adapters: [createEvmAdapter()],
      networks: [mainnet],
      universalProvider: { ...mockProvider, session } as UniversalProvider
    })
    await appKit.ready()

    expect(appKit.getAccount('eip155')?.status).toBe('disconnected')
    expect(appKit.getAccount('eip155')?.isConnected).toBe(false)
    expect(ConnectorController.getConnectorId('eip155')).toBeUndefined()
    expect(StorageUtil.getConnectedConnectorId('eip155')).toBeUndefined()
    expect(StorageUtil.getConnectedNamespaces()).not.toContain('eip155')
    expect(ModalController.close).not.toHaveBeenCalled()
    expect(EventsController.sendEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event: 'CONNECT_SUCCESS' })
    )
  })

  it('restores a valid WalletConnect session', async () => {
    StorageUtil.setConnectedConnectorId('eip155', ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)

    const appKit = new AppKit({
      ...mockOptions,
      basic: true,
      adapters: [createEvmAdapter()],
      networks: [mainnet],
      universalProvider: { ...mockProvider } as UniversalProvider
    })
    await appKit.ready()

    expect(appKit.getAccount('eip155')).toMatchObject({
      status: 'connected',
      isConnected: true,
      caipAddress: mockProvider.session!.namespaces['eip155']!.accounts[0]
    })
    expect(StorageUtil.getConnectedConnectorId('eip155')).toBe(
      ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )
  })

  it('does not restore stale state when reconnect is disabled', async () => {
    StorageUtil.setConnectedConnectorId('eip155', ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)

    const appKit = new AppKit({
      ...mockOptions,
      basic: true,
      enableReconnect: false,
      adapters: [createEvmAdapter()],
      networks: [mainnet],
      universalProvider: { ...mockProvider, session: undefined } as UniversalProvider
    })
    await appKit.ready()

    expect(appKit.getAccount('eip155')).toMatchObject({
      status: 'disconnected',
      isConnected: false
    })
    expect(StorageUtil.getConnectedConnectorId('eip155')).toBeUndefined()
  })

  it('preserves a different namespace connected through an injected wallet', async () => {
    StorageUtil.setConnectedConnectorId('eip155', ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)
    StorageUtil.setConnectedConnectorId('solana', 'solana-connector')
    const solanaAdapter = {
      ...mockSolanaAdapter,
      syncConnection: vi.fn().mockResolvedValue({
        id: 'solana-connector',
        type: 'INJECTED',
        chainId: solana.id,
        address: '7y523k4jsh90d'
      }),
      on: vi.fn(),
      syncConnectors: vi.fn(async () => {
        ConnectorController.setConnectors([
          { id: 'solana-connector', name: 'Solana Wallet', chain: 'solana', type: 'INJECTED' }
        ])
      })
    }

    const appKit = new AppKit({
      ...mockOptions,
      basic: true,
      adapters: [createEvmAdapter(), solanaAdapter],
      networks: [mainnet, solana],
      universalProvider: { ...mockProvider, session: undefined } as UniversalProvider
    })
    await appKit.ready()

    expect(appKit.getAccount('eip155')?.status).toBe('disconnected')
    expect(StorageUtil.getConnectedConnectorId('eip155')).toBeUndefined()
    expect(appKit.getAccount('solana')).toMatchObject({
      status: 'connected',
      isConnected: true,
      address: '7y523k4jsh90d'
    })
    expect(StorageUtil.getConnectedConnectorId('solana')).toBe('solana-connector')
  })

  it('preserves the active WalletConnect address when another namespace is stale', async () => {
    StorageUtil.setConnectedConnectorId('eip155', ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)
    StorageUtil.setConnectedConnectorId('solana', ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)
    const solanaAdapter = { ...mockSolanaAdapter, on: vi.fn() }

    const appKit = new AppKit({
      ...mockOptions,
      basic: true,
      adapters: [createEvmAdapter(), solanaAdapter],
      networks: [mainnet, solana],
      universalProvider: {
        ...mockProvider,
        session: {
          ...mockProvider.session!,
          namespaces: { eip155: mockProvider.session!.namespaces['eip155']! }
        }
      } as unknown as UniversalProvider
    })
    await appKit.ready()

    expect(appKit.getAccount('eip155')?.isConnected).toBe(true)
    expect(ChainController.state.activeCaipAddress).toBe(
      mockProvider.session!.namespaces['eip155']!.accounts[0]
    )
    expect(appKit.getAccount('solana')?.status).toBe('disconnected')
    expect(StorageUtil.getConnectedConnectorId('solana')).toBeUndefined()
  })

  it('does not erase persisted state when provider initialization fails', async () => {
    StorageUtil.setConnectedConnectorId('eip155', ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)
    vi.spyOn(UniversalProvider, 'init').mockRejectedValue(new Error('Provider unavailable'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const appKit = new AppKit({
      ...mockOptions,
      basic: true,
      adapters: [createEvmAdapter()],
      networks: [mainnet],
      universalProvider: undefined
    })
    await appKit.ready()

    expect(StorageUtil.getConnectedConnectorId('eip155')).toBe(
      ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )
    expect(EventsController.sendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'INTERNAL_SDK_ERROR',
        properties: expect.objectContaining({ errorType: 'UniversalProviderInitError' })
      })
    )
  })
})
