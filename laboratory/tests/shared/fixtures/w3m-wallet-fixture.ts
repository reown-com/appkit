import { testM as base } from './w3m-fixture'
import { WalletPage } from '../pages/WalletPage'

// Declare the types of fixtures to use
interface ModalWalletFixture {
  walletPage: WalletPage
}

// MW -> test Modal + Wallet
export const testMW = base.extend<ModalWalletFixture>({
  walletPage: async ({ context, browserName }, use) => {
    // WalletPage needs clipboard permissions with chromium to paste URI
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    }

    // Use a new page, to open alongside the modal
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    await use(walletPage)
  }
})
export { expect } from '@playwright/test'
