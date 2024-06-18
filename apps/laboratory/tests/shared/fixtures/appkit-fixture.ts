/* eslint no-console: 0 */

import { ModalPage } from '../pages/ModalPage'
import { ModalValidator } from '../validators/ModalValidator'
import { timeStart, timeEnd } from '../utils/logs'
import { timingFixture } from './timing-fixture'

// Declare the types of fixtures to use
export interface ModalFixture {
  modalPage: ModalPage
  modalValidator: ModalValidator
  library: string
}

// M -> test Modal
export const testAppKit = timingFixture.extend<ModalFixture>({
  library: ['', { option: true }],
  modalPage: async ({ page }, use) => {
    const modalPage = new ModalPage(page, 'appkit', 'default')
    await modalPage.load()
    await use(modalPage)
  },
  modalValidator: async ({ modalPage }, use) => {
    const modalValidator = new ModalValidator(modalPage.page)
    await use(modalValidator)
  }
})

export { expect } from '@playwright/test'
