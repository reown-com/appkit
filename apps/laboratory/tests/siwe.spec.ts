import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMWSiwe } from './shared/fixtures/w3m-wallet-fixture'
import { testMEmailSiwe } from './shared/fixtures/w3m-email-fixture'

// Setup
testMWSiwe.beforeEach(async ({ modalPage, walletPage }) => {
  const uri = await modalPage.getConnectUri()
  await walletPage.connectWithUri(uri)
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
})

testMEmailSiwe.beforeEach(async ({ modalValidator }) => {
  await modalValidator.expectConnected()
})

// Cleanup
testMWSiwe.afterEach(async ({ modalValidator, walletValidator, browserName }) => {
  if (browserName === 'firefox') {
    return
  }
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testMWSiwe(
  'it should sign in with ethereum',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    await modalPage.promptSiwe()
    await walletValidator.expectReceivedSign({})
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAuthenticated()
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()
    await modalPage.disconnect()
  }
)

testMWSiwe(
  'it should reject sign in with ethereum',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    await modalPage.promptSiwe()
    await walletValidator.expectReceivedSign({})
    await walletPage.handleRequest({ accept: false })
    await modalValidator.expectSignatureDeclined()
    await modalPage.cancelSiwe()
    await modalValidator.expectUnauthenticated()
  }
)

// Email Tests
testMEmailSiwe('it should sign in with email', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})

testMEmailSiwe('it should reject sign in with email', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.rejectSign()
  await modalValidator.expectRejectedSign()
})

testMEmailSiwe('it should switch network and sign', async ({ modalPage, modalValidator }) => {
  let targetChain = 'Polygon'
  await modalPage.switchNetwork(targetChain)
  await modalValidator.expectSwitchedNetwork(targetChain)
  await modalPage.closeModal()
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()

  targetChain = 'Ethereum'
  await modalPage.switchNetwork(targetChain)
  await modalValidator.expectSwitchedNetwork(targetChain)
  await modalPage.closeModal()
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})

testMEmailSiwe('it should disconnect correctly', async ({ modalPage, modalValidator }) => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})
