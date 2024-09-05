import { test } from '@playwright/test'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator

// -- Setup --------------------------------------------------------------------
const noSocialsTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

noSocialsTest.beforeAll(async ({ page, library }) => {
  modalPage = new ModalPage(page, library, 'no-socials')
  modalValidator = new ModalValidator(page)

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
