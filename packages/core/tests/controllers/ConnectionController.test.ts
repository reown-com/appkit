import { polygon } from 'viem/chains'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { type CaipNetwork, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

import type {
  ChainAdapter,
  ConnectionControllerClient,
  ConnectorType,
  NetworkControllerClient
} from '../../exports/index.js'
import {
  ChainController,
  ConnectionController,
  ConstantsUtil,
  ModalController,
  SIWXUtil,
  StorageUtil
} from '../../exports/index.js'

// -- Setup --------------------------------------------------------------------
const chain = CommonConstantsUtil.CHAIN.EVM
const walletConnectUri = 'wc://uri?=123'
const externalId = 'coinbaseWallet'
const type = 'WALLET_CONNECT' as ConnectorType
const storageSpy = vi.spyOn(StorageUtil, 'setConnectedConnectorId')
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
const adapters = [evmAdapter] as ChainAdapter[]

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

  it('should update state correctly on disconnect()', async () => {
    await ConnectionController.disconnect()
    expect(ConnectionController.state.wcUri).toEqual(undefined)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined)
  })

  it('should update state correctly and set wcPromisae on connectWalletConnect()', async () => {
    // Await on set promise and check results
    await ConnectionController.connectWalletConnect()
    expect(storageSpy).toHaveBeenCalledWith('eip155', 'walletConnect')
    expect(clientConnectWalletConnectSpy).toHaveBeenCalled()

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

  it('should disconnect correctly', async () => {
    vi.spyOn(ModalController, 'setLoading')
    vi.spyOn(ChainController, 'disconnect')
    vi.spyOn(SIWXUtil, 'clearSessions')

    await ConnectionController.disconnect()
    expect(ModalController.setLoading).toHaveBeenCalledWith(true)
    expect(SIWXUtil.clearSessions).toHaveBeenCalled()
    expect(ChainController.disconnect).toHaveBeenCalled()
    expect(ModalController.setLoading).toHaveBeenCalledWith(false)
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
})
