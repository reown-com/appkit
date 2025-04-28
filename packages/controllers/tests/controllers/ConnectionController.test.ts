import { polygon } from 'viem/chains'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import {
  type CaipNetwork,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil
} from '@reown/appkit-common'

import type {
  ChainAdapter,
  ConnectionControllerClient,
  ConnectorType,
  NetworkControllerClient
} from '../../exports/index.js'
import {
  ChainController,
  ConnectionController,
  ConnectorController,
  ConstantsUtil,
  ModalController,
  SIWXUtil
} from '../../exports/index.js'

// -- Setup --------------------------------------------------------------------
const chain = CommonConstantsUtil.CHAIN.EVM
const walletConnectUri = 'wc://uri?=123'
const externalId = 'coinbaseWallet'
const type = 'WALLET_CONNECT' as ConnectorType
const caipNetworks = [
  { ...polygon, chainNamespace: chain, caipNetworkId: 'eip155:137' } as CaipNetwork
]

const client: ConnectionControllerClient = {
  connectWalletConnect: async () => {},
  disconnect: async () => Promise.resolve(),
  signMessage: async (message: string) => Promise.resolve(message),
  estimateGas: async () => Promise.resolve(BigInt(0)),
  connectExternal: async _id => Promise.resolve(),
  checkInstalled: _id => true,
  parseUnits: value => BigInt(value),
  formatUnits: value => value.toString(),
  sendTransaction: () => Promise.resolve('0x'),
  writeContract: () => Promise.resolve('0x'),
  getEnsAddress: async (value: string) => Promise.resolve(value),
  getEnsAvatar: async (value: string) => Promise.resolve(value),
  getCapabilities: async () => Promise.resolve(''),
  grantPermissions: async () => Promise.resolve('0x'),
  revokePermissions: async () => Promise.resolve('0x'),
  walletGetAssets: async () => Promise.resolve({})
}

const clientConnectWalletConnectSpy = vi.spyOn(client, 'connectWalletConnect')
const clientConnectExternalSpy = vi.spyOn(client, 'connectExternal')
const clientCheckInstalledSpy = vi.spyOn(client, 'checkInstalled')

const partialClient: ConnectionControllerClient = {
  connectWalletConnect: async () => Promise.resolve(),
  disconnect: async () => Promise.resolve(),
  estimateGas: async () => Promise.resolve(BigInt(0)),
  signMessage: async (message: string) => Promise.resolve(message),
  parseUnits: value => BigInt(value),
  formatUnits: value => value.toString(),
  sendTransaction: () => Promise.resolve('0x'),
  writeContract: () => Promise.resolve('0x'),
  getEnsAddress: async (value: string) => Promise.resolve(value),
  getEnsAvatar: async (value: string) => Promise.resolve(value),
  getCapabilities: async () => Promise.resolve(''),
  grantPermissions: async () => Promise.resolve('0x'),
  revokePermissions: async () => Promise.resolve('0x'),
  walletGetAssets: async () => Promise.resolve({})
}

const evmAdapter = {
  namespace: CommonConstantsUtil.CHAIN.EVM,
  connectionControllerClient: client
}

const solanaAdapter = {
  namespace: CommonConstantsUtil.CHAIN.SOLANA,
  connectionControllerClient: client
}

const bip122Adapter = {
  namespace: CommonConstantsUtil.CHAIN.BITCOIN,
  connectionControllerClient: client
}

const adapters = [evmAdapter, solanaAdapter, bip122Adapter] as ChainAdapter[]

// -- Tests --------------------------------------------------------------------
beforeAll(() => {
  ChainController.initialize(adapters, [], {
    connectionControllerClient: client,
    networkControllerClient: vi.fn() as unknown as NetworkControllerClient
  })
  ConnectionController.setClient(evmAdapter.connectionControllerClient)
})

describe('ConnectionController', () => {
  it('should have valid default state', () => {
    ChainController.initialize(
      [
        {
          namespace: CommonConstantsUtil.CHAIN.EVM,
          connectionControllerClient: client,
          caipNetworks
        }
      ],
      caipNetworks,
      {
        connectionControllerClient: client,
        networkControllerClient: vi.fn() as unknown as NetworkControllerClient
      }
    )

    expect(ConnectionController.state).toEqual({
      wcError: false,
      buffering: false,
      status: 'disconnected',
      _client: evmAdapter.connectionControllerClient
    })
  })
  it('should update state correctly and set wcPromisae on connectWalletConnect()', async () => {
    const setConnectorIdSpy = vi.spyOn(ConnectorController, 'setConnectorId')
    // Await on set promise and check results
    await ConnectionController.connectWalletConnect()
    expect(clientConnectWalletConnectSpy).toHaveBeenCalled()
    expect(setConnectorIdSpy).not.toBeCalled()
    // Just in case
    vi.useRealTimers()
  })

  it('connectExternal() should trigger internal client call and set connector in storage', async () => {
    const options = { id: externalId, type }
    await ConnectionController.connectExternal(options, chain)
    expect(clientConnectExternalSpy).toHaveBeenCalledWith(options)
  })

  it('checkInstalled() should trigger internal client call', () => {
    ConnectionController.checkInstalled([externalId])
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith([externalId])
  })

  it('should not throw on checkInstalled() without ids', () => {
    ConnectionController.checkInstalled()
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith(undefined)
  })

  it('should not throw when optional methods are undefined', async () => {
    ChainController.initialize(
      [
        {
          namespace: CommonConstantsUtil.CHAIN.EVM,
          connectionControllerClient: partialClient,
          caipNetworks: []
        }
      ],
      [],
      {
        connectionControllerClient: partialClient,
        networkControllerClient: vi.fn() as unknown as NetworkControllerClient
      }
    )
    await ConnectionController.connectExternal({ id: externalId, type }, chain)
    ConnectionController.checkInstalled([externalId])
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith([externalId])
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith(undefined)
    expect(ConnectionController._getClient()).toEqual(evmAdapter.connectionControllerClient)
  })

  it('should update state correctly on resetWcConnection()', () => {
    ConnectionController.resetWcConnection()
    expect(ConnectionController.state.wcUri).toEqual(undefined)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined)
  })

  it('should set wcUri correctly', () => {
    // Setup timers for pairing expiry
    const fakeDate = new Date(0)
    vi.useFakeTimers()
    vi.setSystemTime(fakeDate)

    ConnectionController.setUri(walletConnectUri)

    expect(ConnectionController.state.wcUri).toEqual(walletConnectUri)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(ConstantsUtil.FOUR_MINUTES_MS)
  })

  it('should disconnect correctly', async () => {
    const setLoadingSpy = vi.spyOn(ModalController, 'setLoading')
    const clearSessionsSpy = vi.spyOn(SIWXUtil, 'clearSessions')
    const disconnectSpy = vi.spyOn(ChainController, 'disconnect')
    const setFilterByNamespaceSpy = vi.spyOn(ConnectorController, 'setFilterByNamespace')

    await ConnectionController.disconnect()

    expect(setLoadingSpy).toHaveBeenCalledWith(true, undefined)
    expect(clearSessionsSpy).toHaveBeenCalled()
    expect(disconnectSpy).toHaveBeenCalled()
    expect(setLoadingSpy).toHaveBeenCalledWith(false, undefined)
    expect(ConnectionController.state.wcUri).toEqual(undefined)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined)
    expect(setFilterByNamespaceSpy).toHaveBeenCalledWith(undefined)
  })

  it('should disconnect only for specific namespace', async () => {
    const namespace: ChainNamespace = 'solana'
    ChainController.state.chains = new Map<ChainNamespace, ChainAdapter>([
      ['eip155', evmAdapter],
      ['solana', solanaAdapter]
    ])
    ConnectorController.state.activeConnectorIds = {
      eip155: 'eip155-connector',
      solana: 'solana-connector',
      polkadot: 'polkadot-connector',
      bip122: 'bip122-connector',
      cosmos: 'cosmos-connector'
    }
    const setLoadingSpy = vi.spyOn(ModalController, 'setLoading')
    const clearSessionsSpy = vi.spyOn(SIWXUtil, 'clearSessions')
    const disconnectSpy = vi.spyOn(ChainController, 'disconnect')

    await ConnectionController.disconnect(namespace)

    expect(setLoadingSpy).toHaveBeenCalledWith(true, namespace)
    expect(clearSessionsSpy).toHaveBeenCalled()
    expect(disconnectSpy).toHaveBeenCalledWith(namespace)
    expect(setLoadingSpy).toHaveBeenCalledWith(false, namespace)
    expect(ConnectorController.state.activeConnectorIds).toEqual({
      eip155: 'eip155-connector',
      solana: undefined,
      polkadot: 'polkadot-connector',
      bip122: 'bip122-connector',
      cosmos: 'cosmos-connector'
    })
  })

  it('should disconnect multiple namespaces if they are connected with wc', async () => {
    const namespace: ChainNamespace = 'bip122'
    ChainController.state.chains = new Map<ChainNamespace, ChainAdapter>([
      ['eip155', evmAdapter],
      ['solana', solanaAdapter],
      ['bip122', bip122Adapter]
    ])
    ConnectorController.state.activeConnectorIds = {
      eip155: CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT,
      solana: 'solana-connector',
      polkadot: 'polkadot-connector',
      bip122: CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT,
      cosmos: 'cosmos-connector'
    }
    ChainController.state.chains.set('eip155', {
      accountState: {
        caipAddress: 'eip155:1'
      }
    } as unknown as ChainAdapter)
    const setLoadingSpy = vi.spyOn(ModalController, 'setLoading')
    const clearSessionsSpy = vi.spyOn(SIWXUtil, 'clearSessions')
    const disconnectSpy = vi.spyOn(ChainController, 'disconnect')

    await ConnectionController.disconnect(namespace)

    expect(setLoadingSpy).toHaveBeenCalledWith(true, namespace)
    expect(clearSessionsSpy).toHaveBeenCalled()
    expect(disconnectSpy).toHaveBeenCalledWith(namespace)
    expect(setLoadingSpy).toHaveBeenCalledWith(false, namespace)
    expect(ConnectorController.state.activeConnectorIds).toEqual({
      eip155: undefined,
      solana: 'solana-connector',
      polkadot: 'polkadot-connector',
      bip122: undefined,
      cosmos: 'cosmos-connector'
    })
  })

  it('should disconnect multiple namespaces if they are connected with auth', async () => {
    const namespace: ChainNamespace = 'eip155'
    ChainController.state.chains = new Map<ChainNamespace, ChainAdapter>([
      ['eip155', evmAdapter],
      ['solana', solanaAdapter],
      ['bip122', bip122Adapter]
    ])
    ConnectorController.state.activeConnectorIds = {
      eip155: CommonConstantsUtil.CONNECTOR_ID.AUTH,
      solana: CommonConstantsUtil.CONNECTOR_ID.AUTH,
      polkadot: 'polkadot-connector',
      bip122: 'bip122-connector',
      cosmos: 'cosmos-connector'
    }
    ChainController.state.chains.set('eip155', {
      accountState: {
        caipAddress: 'eip155:1'
      }
    } as unknown as ChainAdapter)
    ChainController.state.chains.set('solana', {
      accountState: {
        caipAddress: 'solana:1'
      }
    } as unknown as ChainAdapter)

    const setLoadingSpy = vi.spyOn(ModalController, 'setLoading')
    const clearSessionsSpy = vi.spyOn(SIWXUtil, 'clearSessions')
    const disconnectSpy = vi.spyOn(ChainController, 'disconnect')

    await ConnectionController.disconnect(namespace)

    expect(setLoadingSpy).toHaveBeenCalledWith(true, namespace)
    expect(clearSessionsSpy).toHaveBeenCalled()
    expect(disconnectSpy).toHaveBeenCalledWith(namespace)
    expect(setLoadingSpy).toHaveBeenCalledWith(false, namespace)
    expect(ConnectorController.state.activeConnectorIds).toEqual({
      eip155: undefined,
      solana: undefined,
      polkadot: 'polkadot-connector',
      bip122: 'bip122-connector',
      cosmos: 'cosmos-connector'
    })
  })
})
