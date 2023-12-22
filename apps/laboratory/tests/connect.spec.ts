import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMW } from './shared/fixtures/w3m-wallet-fixture'

testMW.beforeEach(async ({ modalPage, walletPage }) => {
  await modalPage.copyConnectUriToClipboard()
  await walletPage.connect()
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
})

testMW.afterEach(async ({ modalPage, modalValidator, walletValidator }) => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testMW(
  'Should connect and sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()

    // Sign
    await modalPage.sign()
    await walletValidator.expectRecievedSign({})
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
  }
)
