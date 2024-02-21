import { DEFAULT_CHAIN_NAME, DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testConnectedMW } from './shared/fixtures/w3m-wallet-fixture'
import { expectConnection } from './shared/utils/validation'

testConnectedMW.beforeEach(async ({ walletPage, modalValidator, walletValidator }) => {
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  await expectConnection(modalValidator, walletValidator)
})

testConnectedMW.afterEach(async ({ modalPage, modalValidator, walletValidator }) => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testConnectedMW(
  'it should sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName: DEFAULT_CHAIN_NAME })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
  }
)

testConnectedMW(
  'it should reject sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName: DEFAULT_CHAIN_NAME })
    await walletPage.handleRequest({ accept: false })
    await modalValidator.expectRejectedSign()
  }
)

testConnectedMW(
  'it should switch networks and sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    let targetChain = 'Polygon'
    await modalPage.switchNetwork(targetChain)
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName: targetChain })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    // Switch to Ethereum
    targetChain = 'Ethereum'
    await modalPage.switchNetwork(targetChain)
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName: targetChain })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
  }
)
