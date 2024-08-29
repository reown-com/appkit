import { test, type BrowserContext } from '@playwright/test'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const noEmailTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

noEmailTest.beforeAll(async ({ browser, library }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'no-email')
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
})

noEmailTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
noEmailTest('secure site iframe should not be present', () => {
  modalValidator.expectSecureSiteFrameNotInjected()
})
