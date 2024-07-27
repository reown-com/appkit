import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMWSiwe } from './shared/fixtures/w3m-wallet-fixture'
import { ModalValidator } from './shared/validators/ModalValidator'
import { WalletValidator } from './shared/validators/WalletValidator'

// Cleanup
testMWSiwe.afterEach(async ({ modalPage, walletPage, browserName }) => {
  const modalValidator = new ModalValidator(modalPage.page)
  const walletValidator = new WalletValidator(walletPage.page)
  if (browserName === 'firefox') {
    return
  }
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testMWSiwe('it should sign in with ethereum', async ({ modalPage, walletPage }) => {
  const modalValidator = new ModalValidator(modalPage.page)
  const walletValidator = new WalletValidator(walletPage.page)
  const uri = await modalPage.getConnectUri()
  await walletPage.connectWithUri(uri)
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  await modalValidator.expectAuthenticated()
  await modalValidator.expectConnected()
  await walletValidator.expectConnected()
  await modalPage.disconnect()
})

testMWSiwe('it should reject sign in with ethereum', async ({ modalPage, walletPage }) => {
  const modalValidator = new ModalValidator(modalPage.page)
  const uri = await modalPage.getConnectUri()
  await walletPage.connectWithUri(uri)
  await walletPage.handleRequest({ accept: false })
  await modalValidator.expectUnauthenticated()
})

testMWSiwe(
  'it should require re-authentication when switching networks',
  async ({ modalPage, walletPage }) => {
    const modalValidator = new ModalValidator(modalPage.page)
    const walletValidator = new WalletValidator(walletPage.page)
    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectAuthenticated()
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()
    await modalPage.switchNetwork('Polygon')

    // Re-authentication required
    await modalValidator.expectUnauthenticated()
    await modalPage.closeModal()
    await modalValidator.expectDisconnected()
  }
)
