import { testM as base } from '../fixtures/modal-fix'
import { WalletPage } from '../pages/WalletPage'

// Declare the types of fixtures to use
interface ModalWalletFixture {
  walletPage: WalletPage
}

// MW -> test Modal + Wallet
export const testMW = base.extend<ModalWalletFixture>({
  walletPage: async ({ context }, use) => {
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    await use(walletPage)
  }
})
export { expect } from '@playwright/test'
