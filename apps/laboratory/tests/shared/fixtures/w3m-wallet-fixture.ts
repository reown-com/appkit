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
  walletPage: async ({ context, modalPage }, use) => {
    const page = await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context)
    const walletPage = new WalletPage(page)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await use(walletPage)
  },
  walletValidator: async ({ walletPage }, use) => {
    const walletValidator = new WalletValidator(walletPage.page)
    await use(walletValidator)
  }
})
export const testMWSiwe = siwe.extend<ModalWalletFixture>({
  walletPage: async ({ context }, use) => {
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    await use(walletPage)
  },
  walletValidator: async ({ walletPage }, use) => {
    const walletValidator = new WalletValidator(walletPage.page)
    await use(walletValidator)
  }
})

export async function doActionAndWaitForNewPage(
  action: Promise<void>,
  context: BrowserContext
): Promise<Page> {
  if (!context) {
    throw new Error('Browser Context is undefined')
  }
  const pagePromise = context.waitForEvent('page')
  await action
  const newPage = await pagePromise

  return newPage
}

export { expect } from '@playwright/test'
