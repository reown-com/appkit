/* eslint no-console: 0 */

import { test as base } from '@playwright/test'
import { ModalPage } from '../pages/ModalPage'
import { ModalValidator } from '../validators/ModalValidator'
import { timeStart, timeEnd } from '../utils/logs'

// Declare the types of fixtures to use
export interface ModalFixture {
  modalPage: ModalPage
  modalValidator: ModalValidator
  library: string
}

// M -> test Modal
export const testM = base.extend<ModalFixture>({
  library: ['wagmi', { option: true }],
  modalPage: async ({ page, library }, use) => {
    timeStart('new ModalPage')
    const modalPage = new ModalPage(page, library, 'default')
    timeEnd('new ModalPage')
    timeStart('modalPage.load')
    await modalPage.load()
    timeEnd('modalPage.load')
    await use(modalPage)
  },
  modalValidator: async ({ modalPage }, use) => {
    timeStart('new ModalValidator')
    const modalValidator = new ModalValidator(modalPage.page)
    timeEnd('new ModalValidator')
    await use(modalValidator)
  }
})
export const testMSiwe = base.extend<ModalFixture>({
  library: ['wagmi', { option: true }],
  modalPage: async ({ page, library }, use) => {
    const modalPage = new ModalPage(page, library, 'siwe')
    await modalPage.load()
    await use(modalPage)
  },
  modalValidator: async ({ modalPage }, use) => {
    const modalValidator = new ModalValidator(modalPage.page)
    await use(modalValidator)
  }
})

export { expect } from '@playwright/test'
