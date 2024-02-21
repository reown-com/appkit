import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMWSiwe } from './shared/fixtures/w3m-wallet-fixture'
import { expectConnection } from './shared/utils/validation'

testMWSiwe.beforeEach(async ({ walletValidator, modalValidator, walletPage, modalPage }) => {
  const uri = await modalPage.getConnectUri()
  await walletPage.connectWithUri(uri)
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  await expectConnection(modalValidator, walletValidator)
})

testMWSiwe.afterEach(async ({ modalValidator, walletValidator }) => {
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testMWSiwe(
  'it should sign in with ethereum',
  async ({ modalPage, walletPage, modalValidator, walletValidator, browserName }) => {
    // Webkit cannot use clipboard.
    if (browserName === 'webkit') {
      testMWSiwe.skip()

      return
    }
    await modalPage.promptSiwe()
    await walletValidator.expectReceivedSign({})
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAuthenticated()
    // If we don't wait here, we are in disconnected state TODO: check
    await walletPage.page.waitForTimeout(1000)
    await walletValidator.expectSessionCard()
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
