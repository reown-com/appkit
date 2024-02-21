import { testM as base, testMSiwe as siwe } from './w3m-fixture'
import { WalletPage } from '../pages/WalletPage'
import { WalletValidator } from '../validators/WalletValidator'
import type { BrowserContext, Page } from '@playwright/test'
import { DEFAULT_SESSION_PARAMS } from '../constants'

// Declare the types of fixtures to use
interface ModalWalletFixture {
  walletPage: WalletPage
  walletValidator: WalletValidator
}

// MW -> test Modal + Wallet
export const testConnectedMW = base.extend<ModalWalletFixture>({
  walletPage: async ({ context, modalPage, browser }, use) => {
    const newCtx = await browser.newContext()
    const page = await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context, newCtx)
    const walletPage = new WalletPage(page)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await use(walletPage)
    // Cleanup
    await newCtx.close()
  },
  walletValidator: async ({ walletPage }, use) => {
    const walletValidator = new WalletValidator(walletPage.page)
    await use(walletValidator)
  }
})
export const testMWSiwe = siwe.extend<ModalWalletFixture>({
  walletPage: async ({ browser }, use) => {
    const newCtx = await browser.newContext()
    const walletPage = new WalletPage(await newCtx.newPage())
    await walletPage.load()
    await use(walletPage)
    // Cleanup
    await newCtx.close()
  },
  walletValidator: async ({ walletPage }, use) => {
    const walletValidator = new WalletValidator(walletPage.page)
    await use(walletValidator)
  }
})

export async function doActionAndWaitForNewPage(
  action: Promise<void>,
  context: BrowserContext,
  newContext: BrowserContext
): Promise<Page> {
  if (!context) {
    throw new Error('Browser Context is undefined')
  }
  const pagePromise = context.waitForEvent('page')
  await action
  const newPage = await pagePromise
  const url = newPage.url()
  await newPage.close()

  const createdPage = await newContext.newPage()
  await createdPage.goto(url)
  await createdPage.waitForLoadState()

  return createdPage
}

export { expect } from '@playwright/test'
