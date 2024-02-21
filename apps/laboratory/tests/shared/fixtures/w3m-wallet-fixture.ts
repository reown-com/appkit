import { testM as base, testMSiwe as siwe } from './w3m-fixture'
import { WalletPage } from '../pages/WalletPage'
import { WalletValidator } from '../validators/WalletValidator'
import type { BrowserContext, Page } from '@playwright/test'

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
    await use(walletPage)
  },
  walletValidator: async ({ walletPage }, use) => {
    const walletValidator = new WalletValidator(walletPage.page)
    await use(walletValidator)
  }
})
export const testConnectedMWSiwe = siwe.extend<ModalWalletFixture>({
  walletPage: async ({ context, modalPage }, use) => {
    const page = await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context)
    const walletPage = new WalletPage(page)
    await use(walletPage)
  },
  walletValidator: async ({ walletPage }, use) => {
    const walletValidator = new WalletValidator(walletPage.page)
    await use(walletValidator)
  }
})

async function doActionAndWaitForNewPage(
  action: Promise<void>,
  context?: BrowserContext
): Promise<Page> {
  if (!context) {
    throw new Error('Browser Context is undefined')
  }
  const pagePromise = context.waitForEvent('page')
  await action
  const newPage = await pagePromise
  await newPage.waitForLoadState()

  return newPage
}

export { expect } from '@playwright/test'
