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

noEmailTest('should check the terms of service and privacy policy checkbox', async () => {
  // Wait for the page to load
  await modalPage.page.waitForTimeout(200)
  await modalPage.openConnectModal()
  await modalValidator.expectConnectViewToBeDisabled()
  await modalPage.clickLegalCheckbox()
  await modalValidator.expectConnectViewNotToBeDisabled()
})
