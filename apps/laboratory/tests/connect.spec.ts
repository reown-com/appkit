import { DEFAULT_CHAIN_NAME, DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMW } from './shared/fixtures/w3m-wallet-fixture'

testMW.beforeEach(
  async ({ modalPage, walletPage, modalValidator, walletValidator, browserName }) => {
    // Webkit cannot use clipboard.
    if (browserName === 'webkit') {
      return
    }
    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectConnected()
    await walletValidator.expectConnected()
  }
)

testMW.afterEach(async ({ modalPage, modalValidator, walletValidator, browserName }) => {
  // Webkit cannot use clipboard.
  if (browserName === 'webkit') {
    return
  }
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testMW(
  'it should sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator, browserName }) => {
    // Webkit cannot use clipboard.
    if (browserName === 'webkit') {
      testMW.skip()
      return
    }
    await modalPage.sign()
    await walletValidator.expectReceivedSign({chainName: DEFAULT_CHAIN_NAME})
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
  }
)

testMW(
  'it should reject sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator, browserName }) => {
    // Webkit cannot use clipboard.
    if (browserName === 'webkit') {
      testMW.skip()

      return
    }
    await modalPage.sign()
    await walletValidator.expectReceivedSign({chainName: DEFAULT_CHAIN_NAME})
    await walletPage.handleRequest({ accept: false })
    await modalValidator.expectRejectedSign()
  }
)

testMW(
  'it should switch networks and sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator, browserName }) => {
    // Webkit cannot use clipboard.
    if (browserName === 'webkit') {
      testMW.skip()

      return
    }
    // until all namespaces are allowed
    testMW.skip()
    let targetChain = 'Polygon'
    await modalPage.switchNetwork(targetChain)
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName: targetChain })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    // Switch to Ethereum
    targetChain = 'Sepolia'
    await modalPage.switchNetwork(targetChain)
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName: targetChain })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
  }
)
