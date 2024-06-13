import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMWSiwe } from './shared/fixtures/w3m-wallet-fixture'

// Cleanup
testMWSiwe.afterEach(async ({ modalValidator, walletValidator, browserName }) => {
  if (browserName === 'firefox') {
    return
  }
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

// testMWSiwe(
//   'it should sign in with ethereum',
//   async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
//     const uri = await modalPage.getConnectUri()
//     await walletPage.connectWithUri(uri)
//     await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
//     await modalValidator.expectAuthenticated()
//     await modalValidator.expectConnected()
//     await walletValidator.expectConnected()
//     await modalPage.disconnect()
//   }
// )

// testMWSiwe(
//   'it should reject sign in with ethereum',
//   async ({ modalPage, walletPage, modalValidator }) => {
//     const uri = await modalPage.getConnectUri()
//     await walletPage.connectWithUri(uri)
//     await walletPage.handleRequest({ accept: false })
//     await modalValidator.expectUnauthenticated()
//   }
// )

testMWSiwe(
  'it should require re-authentication when switching networks',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectAuthenticated()
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()
    await modalPage.switchNetwork('Polygon')

    // Re-authentication required
    await modalValidator.expectUnauthenticated()
    await modalPage.promptSiwe()
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAuthenticated()
    await modalPage.closeModal()
    await modalPage.disconnect()
  }
)
