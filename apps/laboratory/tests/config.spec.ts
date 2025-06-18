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
  await browserPage.getByTestId('project-id-input').fill('2cc6a5b46203b4bc8350a6c434ad477f')
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
  await modalValidator.expectOnrampProvider(['meld', 'coinbase'])
  await modalPage.closeModal()
})

configTest('Should fetch correct config of projectId with specific features enabled', async () => {
  await browserPage.getByTestId('project-id-button').click()
  await browserPage.getByTestId('project-id-input').fill('34543a363a1559d163355bc5e1572707')
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
  await modalValidator.expectOnrampProvider(['coinbase'])
  await modalPage.closeModal()
})

configTest('Should fetch correct config of projectId with all features disabled', async () => {
  await browserPage.getByTestId('project-id-button').click()
  await browserPage.getByTestId('project-id-input').fill('352fbde37f6c5b3cb7a30f2544fd9fdc')
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
