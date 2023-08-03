import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMW } from './shared/fixtures/w3m-wallet-fixture'

// Initialize the connection
testMW.beforeEach(async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
  await modalPage.getUri()
  await walletPage.connect()
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  await modalValidator.expectConnected()
  await walletValidator.expectConnected()
})

testMW(
  'Should handle all sign requests',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    // Should accept sign
    await modalPage.sign()
    await walletValidator.expectRecievedSign({})
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
    await modalPage.closePopup()

    // Should reject sign
    await modalPage.sign()
    await walletValidator.expectRecievedSign({})
    await walletPage.handleRequest({ accept: false })
    await modalValidator.expectRejectedSign()
    await modalPage.closePopup()

    // Should accept sign typed
    await modalPage.signTyped()
    await walletValidator.expectRecievedSignTyped({})
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSignTyped()
    await modalPage.closePopup()

    // Should reject sign typed
    await modalPage.signTyped()
    await walletValidator.expectRecievedSignTyped({})
    await walletPage.handleRequest({ accept: false })
    await modalValidator.expectRejectedSignTyped()
    await modalPage.closePopup()

    // Should accept sign with chain switch
    await modalPage.switchChain({ chainName: 'Polygon' })
    await modalPage.closeModal()
    await modalPage.sign()
    await walletValidator.expectRecievedSign({ chainName: 'Polygon' })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
    await modalPage.closePopup()

    // Should reject sign with chain switch
    await modalPage.switchChain({ chainName: 'Ethereum' })
    await modalPage.closeModal()
    await modalPage.signTyped()
    await walletValidator.expectRecievedSignTyped({ chainName: 'Ethereum' })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSignTyped()
    await modalPage.closePopup()

    // Should be able to disconnect
  }
)

testMW(
  'Should connect, send disconnect, wallet should recieve disconnect event',
  async ({ modalPage, modalValidator, walletValidator }) => {
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()
    await modalPage.disconnect()
    await modalValidator.expectDisconnected()
    await walletValidator.expectDisconnected()
  }
)

testMW(
  'Should connect, recieve disconnect event from wallet',
  async ({ walletPage, modalValidator, walletValidator }) => {
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()
    await walletPage.disconnect()
    await walletValidator.expectDisconnected()
    await modalValidator.expectDisconnected()
  }
)
