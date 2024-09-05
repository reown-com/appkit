import { test, type BrowserContext } from '@playwright/test'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let context: BrowserContext

// -- Setup --------------------------------------------------------------------
const noSocialsTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

noSocialsTest.beforeAll(async ({ browser, library }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'no-socials')
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
  await modalPage.openConnectModal()
})

noSocialsTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
noSocialsTest('should not display any socials', () => {
  modalValidator.expectNoSocials()
})

noSocialsTest('should show email login', () => {
  modalValidator.expectEmailLogin()
})
