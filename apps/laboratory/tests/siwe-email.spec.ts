import { expect, test, type BrowserContext } from '@playwright/test'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import { ModalWalletValidator } from './shared/validators/ModalWalletValidator'
import { SECURE_WEBSITE_URL } from './shared/constants'

/* eslint-disable init-declarations */
let page: ModalWalletPage
let validator: ModalWalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const emailSiweTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

emailSiweTest.describe.configure({ mode: 'serial' })

emailSiweTest.beforeAll(async ({ browser, library }, testInfo) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  page = new ModalWalletPage(browserPage, library, 'all')
  validator = new ModalWalletValidator(browserPage)

  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)
  const tempEmail = email.getEmailAddressToUse(testInfo.parallelIndex)
  await page.emailFlow(tempEmail, context, mailsacApiKey)
  await page.promptSiwe()
  await page.approveSign()

  await validator.expectConnected()
  await validator.expectAuthenticated()
})

emailSiweTest.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
emailSiweTest('it should sign', async () => {
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailSiweTest('it should upgrade wallet', async () => {
  const walletUpgradePage = await page.clickWalletUpgradeCard(context)
  expect(walletUpgradePage.url()).toContain(SECURE_WEBSITE_URL)
  await walletUpgradePage.close()
  await page.closeModal()
})

emailSiweTest('it should reject sign', async () => {
  await page.sign()
  await page.rejectSign()
  await validator.expectRejectedSign()
})

emailSiweTest('it should switch network and sign', async () => {
  let targetChain = 'Polygon'
  await page.openAccount()
  await page.openProfileView()
  await page.openSettings()
  await page.switchNetwork(targetChain)
  await page.promptSiwe()
  await page.approveSign()
  await validator.expectSwitchedNetwork(targetChain)
  await page.closeModal()
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()

  targetChain = 'Ethereum'
  await page.openAccount()
  await page.openProfileView()
  await page.openSettings()
  await page.switchNetwork(targetChain)
  await page.promptSiwe()
  await page.approveSign()
  await validator.expectSwitchedNetwork(targetChain)
  await page.closeModal()
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailSiweTest('it should disconnect correctly', async () => {
  await page.openAccount()
  await page.openProfileView()
  await page.openSettings()
  await page.disconnect()
  await validator.expectDisconnected()
})
