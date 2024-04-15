import { describe, expect, it, vi } from 'vitest'
import type { ConnectionControllerClient, ConnectorType } from '../../index.js'
import { ConnectionController, ConstantsUtil, StorageUtil } from '../../index.js'

// -- Setup --------------------------------------------------------------------
const walletConnectUri = 'wc://uri?=123'
const externalId = 'coinbaseWallet'
const type = 'EMAIL' as ConnectorType
const storageSpy = vi.spyOn(StorageUtil, 'setConnectedConnector')

const client: ConnectionControllerClient = {
  connectWalletConnect: async onUri => {
    onUri(walletConnectUri)
    await Promise.resolve(walletConnectUri)
  },
  disconnect: async () => Promise.resolve(),
  signMessage: async (message: string) => Promise.resolve(message),
  connectExternal: async _id => Promise.resolve(),
  checkInstalled: _id => true
}

const clientConnectExternalSpy = vi.spyOn(client, 'connectExternal')
const clientCheckInstalledSpy = vi.spyOn(client, 'checkInstalled')

const partialClient: ConnectionControllerClient = {
  connectWalletConnect: async () => Promise.resolve(),
  disconnect: async () => Promise.resolve(),
  signMessage: async (message: string) => Promise.resolve(message)
}

// -- Tests --------------------------------------------------------------------
describe('ConnectionController', () => {
  it('should throw if client not set', () => {
    expect(ConnectionController._getClient).toThrow('ConnectionController client not set')
  })

  it('should have valid default state', () => {
    ConnectionController.setClient(client)

    expect(ConnectionController.state).toEqual({
      wcError: false,
      buffering: false,
      _client: ConnectionController._getClient()
    })
  })

  it('should update state correctly on disconnect()', async () => {
    await ConnectionController.disconnect()
    expect(ConnectionController.state.wcUri).toEqual(undefined)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined)
    expect(ConnectionController.state.wcPromise).toEqual(undefined)
  })

  it('should update state correctly and set wcPromise on connectWalletConnect()', async () => {
    // Setup timers for pairing expiry
    const fakeDate = new Date(0)
    vi.useFakeTimers()
    vi.setSystemTime(fakeDate)

    ConnectionController.connectWalletConnect()
    expect(ConnectionController.state.wcPromise).toBeDefined()

    // Await on set promise and check results
    await ConnectionController.state.wcPromise
    expect(ConnectionController.state.wcUri).toEqual(walletConnectUri)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(ConstantsUtil.FOUR_MINUTES_MS)
    expect(storageSpy).toHaveBeenCalledWith('WALLET_CONNECT')

    // Just in case
    vi.useRealTimers()
  })

  it('connectExternal() should trigger internal client call and set connector in storage', async () => {
    const options = { id: externalId, type }
    await ConnectionController.connectExternal(options)
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
    ConnectionController.setClient(partialClient)
    await ConnectionController.connectExternal({ id: externalId, type })
    ConnectionController.checkInstalled([externalId])
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith([externalId])
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith(undefined)
    expect(ConnectionController.state._client).toEqual(partialClient)
  })

  it('should update state correctly on resetWcConnection()', () => {
    ConnectionController.resetWcConnection()
    expect(ConnectionController.state.wcUri).toEqual(undefined)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined)
    expect(ConnectionController.state.wcPromise).toEqual(undefined)
  })
})
