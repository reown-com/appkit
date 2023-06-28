import { ConnectionController } from '../../index'
import { describe, it, expect } from 'vitest'

// -- Setup --------------------------------------------------------------------
const walletConnectUri = 'wc://uri?=123'
const browserExtensionId = 'isMetaMask'
const thirdPartyWalletId = 'coinbase'

const controller = new ConnectionController({
  getWalletConnectUri: async () => Promise.resolve(walletConnectUri),
  connectWalletConnect: async () => Promise.resolve(),
  connectBrowserExtension: async (id: string) => {
    id.toUpperCase()
    await Promise.resolve()
  },
  connectThirdPartyWallet: async (id: string) => {
    id.toUpperCase()
    await Promise.resolve()
  }
})

const partialController = new ConnectionController({
  getWalletConnectUri: async () => Promise.resolve(walletConnectUri),
  connectWalletConnect: async () => Promise.resolve()
})

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should have valid default state', () => {
    expect(controller.state).toEqual({
      walletConnectUri: ''
    })
  })

  it('should update state correctly on getWalletConnectUri()', async () => {
    await controller.getWalletConnectUri()
    expect(controller.state.walletConnectUri).toEqual(walletConnectUri)
  })

  it('should not throw on connectWalletConnect()', async () => {
    await controller.connectWalletConnect()
  })

  it('should not throw on connectBrowserExtension()', async () => {
    await controller.connectBrowserExtension(browserExtensionId)
    await partialController.connectBrowserExtension(browserExtensionId)
  })

  it('should not throw on connectThirdPartyWallet()', async () => {
    await controller.connectThirdPartyWallet(thirdPartyWalletId)
    await partialController.connectThirdPartyWallet(thirdPartyWalletId)
  })
})
