import { type BrowserContext, type Page, test } from '@playwright/test'

import { ALL_SOCIALS, WalletPage } from '@reown/appkit-testing'

import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let context: BrowserContext
let browserPage: Page
let walletPage: WalletPage
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const configTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

configTest.describe.configure({ mode: 'serial' })

configTest.beforeAll(async ({ browser, library }) => {
  context = await browser.newContext()
  browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'default')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(modalPage.page)

  await modalPage.load()
})

configTest.afterEach(async () => {
  await modalPage.disconnect()
})

configTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
configTest('Should fetch correct config of projectId with all features enabled', async () => {
  await browserPage.getByTestId('project-id-button').click()
  // See the project on dashboard.reown.com Admin's Team > AppKit E2E Config Tests
  await browserPage.getByTestId('project-id-input').fill('5164c17d2d7091727aef80eeb55d7290')
  await browserPage.getByTestId('project-id-save-button').click()
  await browserPage.reload()

  await modalPage.openConnectModal()
  await modalValidator.expectUxBrandingReown(true)
  await modalValidator.expectEmailLogin()
  await modalPage.openAllSocials()
  await modalValidator.expectSpecificSocialsVisible(ALL_SOCIALS)
  await modalPage.closeModal()

  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()

  await modalPage.openModal()
  await modalValidator.expectSwapsButton(true)
  await modalValidator.expectActivityButton(true)
  await modalValidator.expectOnrampButton(true)

  await modalPage.openOnramp()
  await modalValidator.expectOnrampProvider(['meld'])
  await modalPage.closeModal()
})

configTest('Should fetch correct config of projectId with specific features enabled', async () => {
  await browserPage.getByTestId('project-id-button').click()
  // See the project on dashboard.reown.com Admin's Team > AppKit E2E Config Tests 2
  await browserPage.getByTestId('project-id-input').fill('f0d34629513aeb67746e0bb2a52e59fc')
  await browserPage.getByTestId('project-id-save-button').click()
  await browserPage.reload()

  await modalPage.openConnectModal()
  await modalValidator.expectUxBrandingReown(true)
  await modalValidator.expectEmailLoginNotVisible()
  await modalValidator.expectSpecificSocialsVisible(['google', 'x', 'discord'])
  await modalPage.closeModal()

  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()

  await modalPage.openModal()
  await modalValidator.expectSwapsButton(false)
  await modalValidator.expectActivityButton(true)
  await modalValidator.expectOnrampButton(true)
  await modalPage.openOnramp()
  await modalValidator.expectOnrampProvider(['meld'])
  await modalPage.closeModal()
})

configTest('Should fetch correct config of projectId with all features disabled', async () => {
  await browserPage.getByTestId('project-id-button').click()
  // See the project on dashboard.reown.com Admin's Team > AppKit E2E Config Tests 3
  await browserPage.getByTestId('project-id-input').fill('8771bbe81fcf7903aabaf5f9f462cbc5')
  await browserPage.getByTestId('project-id-save-button').click()
  await browserPage.reload()

  await modalPage.openConnectModal()
  await modalValidator.expectUxBrandingReown(false)
  await modalValidator.expectEmailLoginNotVisible()
  await modalValidator.expectSocialsNotVisible()
  await modalPage.closeModal()

  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()

  await modalPage.openModal()
  await modalValidator.expectSwapsButton(false)
  await modalValidator.expectActivityButton(false)
  await modalValidator.expectOnrampButton(false)
  await modalPage.closeModal()
})
