import { test as base } from '@playwright/test'
import { WalletPage } from './WalletPage'
import { ModalPage } from './ModalPage'

// Declare the types of fixtures to use
interface ModalWalletFixture {
  walletPage: WalletPage
  modalPage: ModalPage
}

export const test = base.extend<ModalWalletFixture>({
  walletPage: async ({ page }) => {
    // Set up the fixture.
    const walletPage = new WalletPage(page)
    await walletPage.goto()
  },

  modalPage: async ({ page }) => {
    // Set up the fixture.
    const modalPage = new ModalPage(page)
    await modalPage.goto()
  }
})
export { expect } from '@playwright/test'
