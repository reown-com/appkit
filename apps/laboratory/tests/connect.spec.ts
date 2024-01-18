/* eslint-disable init-declarations */
import type { BrowserContext } from '@playwright/test'
import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testM } from './shared/fixtures/w3m-fixture'
import { WalletPage } from './shared/pages/WalletPage'
import { WalletValidator } from './shared/validators/WalletValidator'

let walletPage: WalletPage | undefined
let walletValidator: WalletValidator | undefined
let context: BrowserContext | undefined

testM.beforeEach(async ({ modalPage, modalValidator, context: ctx }) => {
  context = ctx
  await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink())
  await walletPage?.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  await modalValidator.expectConnected()
  await walletValidator?.expectConnected()
})

testM.afterEach(async ({ modalPage, modalValidator }) => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await walletValidator?.expectDisconnected()
})

testM('it should sign', async ({ modalPage, modalValidator }) => {
  await doActionAndWaitForNewPage(modalPage.sign())
  await walletValidator?.expectReceivedSign({})
  await walletPage?.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()
})

testM('it should reject sign', async ({ modalPage, modalValidator }) => {
  await doActionAndWaitForNewPage(modalPage.sign())
  await walletValidator?.expectReceivedSign({})
  await walletPage?.handleRequest({ accept: false })
  await modalValidator.expectRejectedSign()
})

testM('it should switch networks and sign', async ({ modalPage, modalValidator }) => {
  let targetChain = 'Polygon'
  await modalPage.switchNetwork(targetChain)
  await doActionAndWaitForNewPage(modalPage.sign())
  await walletValidator?.expectReceivedSign({ chainName: targetChain })
  await walletPage?.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()

  // Switch to Ethereum
  targetChain = 'Ethereum'
  await modalPage.switchNetwork(targetChain)
  await doActionAndWaitForNewPage(modalPage.sign())
  await walletValidator?.expectReceivedSign({ chainName: targetChain })
  await walletPage?.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()
})

async function doActionAndWaitForNewPage(action: Promise<void>) {
  if (!context) {
    throw new Error('Browser Context is undefined')
  }
  const pagePromise = context.waitForEvent('page')
  await action
  const newPage = await pagePromise
  await newPage.waitForLoadState()
  walletPage = new WalletPage(newPage)
  walletValidator = new WalletValidator(walletPage.page)
}
