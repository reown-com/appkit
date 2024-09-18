import { beforeAll, describe, expect, it, vi } from 'vitest'
import type {
  ChainAdapter,
  ConnectionControllerClient,
  ConnectorType
} from '../../exports/index.js'
import {
  ChainController,
  ConnectionController,
  ConstantsUtil,
  StorageUtil
} from '../../exports/index.js'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

// -- Setup --------------------------------------------------------------------
const chain = CommonConstantsUtil.CHAIN.EVM
const walletConnectUri = 'wc://uri?=123'
const externalId = 'coinbaseWallet'
const type = 'AUTH' as ConnectorType
const storageSpy = vi.spyOn(StorageUtil, 'setConnectedConnector')

const client: ConnectionControllerClient = {
  connectWalletConnect: async onUri => {
    onUri(walletConnectUri)
    await Promise.resolve(walletConnectUri)
  },
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
  request: async () => Promise.resolve('0x')
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
  request: async () => Promise.resolve('0x')
}

const evmAdapter = {
  chainNamespace: CommonConstantsUtil.CHAIN.EVM,
  connectionControllerClient: client
}
const adapters = [evmAdapter] as ChainAdapter[]
const universalAdapter = {
  chainNamespace: 'eip155',
  connectionControllerClient: client,
  caipNetworks: []
} as ChainAdapter

// -- Tests --------------------------------------------------------------------
beforeAll(() => {
  ChainController.initialize(adapters)
  ChainController.initializeUniversalAdapter(universalAdapter, adapters)
})

describe('ConnectionController', () => {
  it('should have valid default state', () => {
    ChainController.initialize([
      {
        chainNamespace: CommonConstantsUtil.CHAIN.EVM,
        connectionControllerClient: client,
        caipNetworks: []
      }
    ])

    expect(ConnectionController.state).toEqual({
      wcError: false,
      buffering: false,
      status: 'disconnected'
    })
  })

  it('should update state correctly on disconnect()', async () => {
    await ConnectionController.disconnect()
    expect(ConnectionController.state.wcUri).toEqual(undefined)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined)
  })

  it('should update state correctly and set wcPromisae on connectWalletConnect()', async () => {
    // Setup timers for pairing expiry
    const fakeDate = new Date(0)
    vi.useFakeTimers()
    vi.setSystemTime(fakeDate)

    // Await on set promise and check results
    await ConnectionController.connectWalletConnect()
    expect(ConnectionController.state.wcUri).toEqual(walletConnectUri)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(ConstantsUtil.FOUR_MINUTES_MS)
    expect(storageSpy).toHaveBeenCalledWith('WALLET_CONNECT')
    expect(clientConnectWalletConnectSpy).toHaveBeenCalled()

    // Just in case
    vi.useRealTimers()
  })

  it('connectExternal() should trigger internal client call and set connector in storage', async () => {
    const options = { id: externalId, type }
    await ConnectionController.connectExternal(options, chain)
    expect(storageSpy).toHaveBeenCalledWith(type)
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
    ChainController.initialize([
      {
        chainNamespace: CommonConstantsUtil.CHAIN.EVM,
        connectionControllerClient: partialClient,
        caipNetworks: []
      }
    ])
    await ConnectionController.connectExternal({ id: externalId, type }, chain)
    ConnectionController.checkInstalled([externalId])
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith([externalId])
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith(undefined)
    expect(ConnectionController._getClient()).toEqual(partialClient)
  })

  it('should update state correctly on resetWcConnection()', () => {
    ConnectionController.resetWcConnection()
    expect(ConnectionController.state.wcUri).toEqual(undefined)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined)
  })
})
