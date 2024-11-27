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
const smartAccountSiweTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

smartAccountSiweTest.describe.configure({ mode: 'serial' })

smartAccountSiweTest.beforeAll(async ({ browser, library }) => {
  smartAccountSiweTest.setTimeout(300000)
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

  // Switch to a SA enabled network
  await validator.expectDisconnected()
  await page.switchNetworkWithNetworkButton('Polygon')
  await validator.expectSwitchedNetworkOnNetworksView('Polygon')
  await page.closeModal()
  const tempEmail = await email.getEmailAddressToUse()

  // Iframe should not be injected until needed
  validator.expectSecureSiteFrameNotInjected()
  await page.emailFlow(tempEmail, context, mailsacApiKey)
  await page.promptSiwe()
  await page.approveSign()

  await validator.expectConnected()
  await validator.expectAuthenticated()
})

smartAccountSiweTest.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
smartAccountSiweTest('it should sign with siwe + smart account', async () => {
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

smartAccountSiweTest('it should upgrade wallet', async () => {
  const walletUpgradePage = await page.clickWalletUpgradeCard(context)
  expect(walletUpgradePage.url()).toContain(SECURE_WEBSITE_URL)
  await walletUpgradePage.close()
  await page.closeModal()
})

smartAccountSiweTest('it should switch to a smart account enabled network and sign', async () => {
  const targetChain = 'Sepolia'
  await page.switchNetwork(targetChain)
  await page.promptSiwe()
  await page.approveSign()

  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

smartAccountSiweTest('it should switch to a not enabled network and sign with EOA', async () => {
  const targetChain = 'Aurora'
  await page.switchNetwork(targetChain)
  await page.page.waitForTimeout(1000)
  await page.promptSiwe()
  await page.approveSign()

  await page.openAccount()
  // Shouldn't show the toggle on a non enabled network
  await validator.expectTogglePreferredTypeVisible(false)
  await page.closeModal()

  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

smartAccountSiweTest('it should disconnect correctly', async () => {
  await page.goToSettings()
  await page.disconnect()
  await validator.expectDisconnected()
})
