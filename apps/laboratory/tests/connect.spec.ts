/* eslint-disable init-declarations */
import type { BrowserContext } from '@playwright/test'
import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testM } from './shared/fixtures/w3m-fixture'
import { WalletPage } from './shared/pages/WalletPage'
import { WalletValidator } from './shared/validators/WalletValidator'

let walletPage: WalletPage
let walletValidator: WalletValidator

testM.beforeEach(async ({ modalPage, modalValidator, context }) => {
  const page = await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context)
  walletPage = new WalletPage(page)
  walletValidator = new WalletValidator(walletPage.page)
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  await modalValidator.expectConnected()
  await walletValidator.expectConnected()
  // Manually remove deeplink choice to avoid opening new page on every request
  await modalPage.page.evaluate(`window.localStorage.setItem('WALLETCONNECT_DEEPLINK_CHOICE', '')`)
})

testM.afterEach(async ({ modalPage, modalValidator }) => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testM('it should sign', async ({ modalPage, modalValidator }) => {
  modalPage.sign()
  await walletValidator.expectReceivedSign({})
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()
})

testM('it should reject sign', async ({ modalPage, modalValidator }) => {
  modalPage.sign()
  await walletValidator.expectReceivedSign({})
  await walletPage.handleRequest({ accept: false })
  await modalValidator.expectRejectedSign()
})

testM('it should switch networks and sign', async ({ modalPage, modalValidator }) => {
  let targetChain = 'Polygon'
  await modalPage.switchNetwork(targetChain)
  await modalValidator.expectNetwork(targetChain)
  modalPage.sign()
  await walletValidator.expectReceivedSign({ chainName: targetChain })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()
  // Switch to Ethereum
  targetChain = 'Ethereum'
  await modalPage.switchNetwork(targetChain)
  await modalValidator.expectNetwork(targetChain)
  modalPage.sign()
  await walletValidator.expectReceivedSign({ chainName: targetChain })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()
})

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
