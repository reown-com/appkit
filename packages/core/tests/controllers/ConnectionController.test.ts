import { ConnectionController } from '../../index'
import { describe, it, expect } from 'vitest'

// -- Setup --------------------------------------------------------------------
const walletConnectUri = 'wc://uri?=123'
const browserExtensionId = 'isMetaMask'
const thirdPartyWalletId = 'coinbase'

const client = {
  getWalletConnectUri: async () => Promise.resolve(walletConnectUri),
  connectWalletConnect: async () => Promise.resolve(),
  disconnect: async () => Promise.resolve(),
  connectBrowserExtension: async (_id: string) => Promise.resolve(),
  connectThirdPartyWallet: async (_id: string) => Promise.resolve()
}

const partialClient = {
  getWalletConnectUri: async () => Promise.resolve(walletConnectUri),
  connectWalletConnect: async () => Promise.resolve(),
  disconnect: async () => Promise.resolve()
}

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should throw if client not set', () => {
    expect(ConnectionController._getClient).toThrow('ConnectionController client not set')
  })

  it('should have valid default state', () => {
    ConnectionController.setClient(client)

    expect(ConnectionController.state).toEqual({
      _client: ConnectionController._getClient(),
      walletConnectUri: ''
    })
  })

  it('should update state correctly on getWalletConnectUri()', async () => {
    await ConnectionController.getWalletConnectUri()
    expect(ConnectionController.state.walletConnectUri).toEqual(walletConnectUri)
  })

  it('should update state correctly on disconnect()', async () => {
    await ConnectionController.disconnect()
    expect(ConnectionController.state.walletConnectUri).toEqual('')
  })

  it('should not throw on connectWalletConnect()', async () => {
    await ConnectionController.connectWalletConnect()
  })

  it('should not throw on connectBrowserExtension()', async () => {
    await ConnectionController.connectBrowserExtension(browserExtensionId)
  })

  it('should not throw on connectThirdPartyWallet()', async () => {
    await ConnectionController.connectThirdPartyWallet(thirdPartyWalletId)
  })

  it('should not throw when optional methods are undefined', async () => {
    ConnectionController.setClient(partialClient)

    await ConnectionController.connectThirdPartyWallet(thirdPartyWalletId)
    await ConnectionController.connectBrowserExtension(browserExtensionId)
  })
})
