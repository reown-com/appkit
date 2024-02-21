import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import {
  doActionAndWaitForNewPage,
  testConnectedMWSiwe
} from './shared/fixtures/w3m-wallet-fixture'
import { expectConnection } from './shared/utils/validation'

testConnectedMWSiwe.beforeEach(
  async ({ walletValidator, modalValidator, modalPage, walletPage, context }) => {
    await walletPage.page.close()
    const page = await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context)
    walletPage.loadNewPage(page)
    walletValidator.loadNewPage(page)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await expectConnection(modalValidator, walletValidator)
  }
)

testConnectedMWSiwe.afterEach(async ({ modalValidator, walletValidator }) => {
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testConnectedMWSiwe(
  'it should sign in with ethereum',
  async ({ modalPage, walletPage, modalValidator, walletValidator, browserName }) => {
    // Webkit cannot use clipboard.
    if (browserName === 'webkit') {
      testConnectedMWSiwe.skip()

      return
    }
    await modalPage.promptSiwe()
    await walletValidator.expectReceivedSign({})
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAuthenticated()
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()
    await modalPage.disconnect()
  }
)

testConnectedMWSiwe(
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
