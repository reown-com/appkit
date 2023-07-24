import { test as base } from '@playwright/test'
import { ModalPage } from '../pages/ModalPage'

// Declare the types of fixtures to use
interface ModalWalletFixture {
  modalPage: ModalPage
}

// M -> test Modal
export const testM = base.extend<ModalWalletFixture>({
  modalPage: async ({ page }, use) => {
    const modalPage = new ModalPage(page)
    await modalPage.load()
    await use(modalPage)
  }
})
export { expect } from '@playwright/test'
