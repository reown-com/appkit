import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { appKitTestMW } from './shared/fixtures/appkit-wallet-fixture'
import { doActionAndWaitForNewPage } from './shared/utils/actions'
import { expectConnection } from './shared/utils/validation'

appKitTestMW.beforeEach(async ({ modalValidator, walletValidator }) => {
  await expectConnection(modalValidator, walletValidator)
})

appKitTestMW.afterEach(async ({ modalPage, modalValidator, walletValidator, browserName }) => {
  if (browserName === 'firefox') {
    return
  }
  await modalPage.disconnect()

  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

appKitTestMW(
  'it should sign on both evm and solana',
  async ({ context, modalPage, walletPage, modalValidator, walletValidator }) => {
    await modalPage.sign()
    await walletValidator.expectReceivedSign({})
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
    // Switch to Solana and connect again
    await modalPage.switchNetwork('Solana')
    await modalValidator.expectConnectScreen()
    await modalPage.closeModal()

    await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  }
)
