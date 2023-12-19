import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMW } from './shared/fixtures/w3m-wallet-fixture'

// Initialize the connection
testMW.beforeEach(async ({ modalPage, walletPage }) => {
  await modalPage.getWalletConnectV2Uri() // Copies to clopboard
  await walletPage.connect()
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
})

testMW('Should connect', async ({ modalValidator, walletValidator }) => {
  await modalValidator.expectConnected()
  await walletValidator.expectConnected()
})
