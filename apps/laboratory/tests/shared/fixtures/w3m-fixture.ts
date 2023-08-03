import { test as base } from '@playwright/test'
import { ModalPage } from '../pages/ModalPage'
import { ModalValidator } from '../validators/ModalValidator'

// Declare the types of fixtures to use
interface ModalFixture {
  modalPage: ModalPage
  modalValidator: ModalValidator
}

// M -> test Modal
export const testM = base.extend<ModalFixture>({
  modalPage: async ({ page }, use) => {
    const modalPage = new ModalPage(page)
    await modalPage.load()
    await use(modalPage)
  },
  modalValidator: async ({ modalPage }, use) => {
    const modalValidator = new ModalValidator(modalPage.page)
    await use(modalValidator)
  }
})
export { expect } from '@playwright/test'
