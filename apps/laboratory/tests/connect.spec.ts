import type { BrowserContext } from '@playwright/test'
import { DEFAULT_CHAIN_NAME, DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMW } from './shared/fixtures/w3m-wallet-fixture'

testMW.beforeEach(async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
  const page = await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context)
  /* Temp remove
  const uri = await modalPage.getConnectUri()
  await walletPage.connectWithUri(uri)
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  */
  await modalValidator.expectConnected()
  await walletValidator.expectConnected()
})

testMW.afterEach(async ({ modalPage, modalValidator, walletValidator }) => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testMW('it should sign', async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
  await modalPage.sign()
  await walletValidator.expectReceivedSign({ chainName: DEFAULT_CHAIN_NAME })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()
})

testMW(
  'it should reject sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName: DEFAULT_CHAIN_NAME })
    await walletPage.handleRequest({ accept: false })
    await modalValidator.expectRejectedSign()
  }
)

testMW(
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

async function doActionAndWaitForNewPage(action: Promise<void>, context?: BrowserContext) {
  if (!context) {
    throw new Error('Browser Context is undefined')
  }
  const pagePromise = context.waitForEvent('page')
  await action
  const newPage = await pagePromise
  await newPage.waitForLoadState()

  return newPage
}
