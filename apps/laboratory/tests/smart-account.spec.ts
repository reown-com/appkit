import { expect, test, type BrowserContext } from '@playwright/test'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import { EOA, ModalWalletValidator, SMART_ACCOUNT } from './shared/validators/ModalWalletValidator'
import { SECURE_WEBSITE_URL } from './shared/constants'

/* eslint-disable init-declarations */
let page: ModalWalletPage
let validator: ModalWalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const smartAccountTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

smartAccountTest.describe.configure({ mode: 'serial' })

smartAccountTest.beforeAll(async ({ browser, library }, testInfo) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  page = new ModalWalletPage(browserPage, library)
  validator = new ModalWalletValidator(browserPage)

  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)

  // Switch to a SA enabled network
  await page.switchNetworkWithNetworkButton('Polygon')
  await page.closeModal()
  const tempEmail = email.getEmailAddressToUse(testInfo.parallelIndex)
  await page.emailFlow(tempEmail, context, mailsacApiKey)
  await page.promptSiwe()
  await page.approveSign()

  await validator.expectConnected()
  await validator.expectAuthenticated()
})

smartAccountTest.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
smartAccountTest('it should use a Smart Account', async () => {
  await validator.expectConnected()
  await page.openAccount()
  await validator.expectActivateSmartAccountPromoVisible(false)

  await page.openProfileView()
  await page.openSettings()
  await validator.expectChangePreferredAccountToShow(EOA)
  await page.closeModal()
})

smartAccountTest('it should sign with smart account 6492 signature', async () => {
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()

  const signature = await page.getSignature()
  const address = await page.getAddress()
  const chainId = await page.getChainId()

  await validator.expectValidSignature(signature, address, chainId)
})

smartAccountTest('it should upgrade wallet', async () => {
  const walletUpgradePage = await page.clickWalletUpgradeCard(context)
  expect(walletUpgradePage.url()).toContain(SECURE_WEBSITE_URL)
  await walletUpgradePage.close()
  await page.closeModal()
})

smartAccountTest('it should switch to a SA enabled network and sign', async () => {
  const targetChain = 'Sepolia'
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

smartAccountTest('it should switch to a not enabled network and sign with EOA', async () => {
  const targetChain = 'Ethereum'
  await page.openAccount()
  await page.openProfileView()
  await page.openSettings()
  await page.switchNetwork(targetChain)
  /*
   * Flaky as network switch to non-enabled network changes network AND address causing 2 siwe popups
   * Test goes too fast and the second siwe popup is not handled
   */
  await page.page.waitForTimeout(1000)
  await page.promptSiwe()
  await page.approveSign()
  await validator.expectSwitchedNetwork(targetChain)
  // Shouldn't show the toggle on a non enabled network
  await validator.expectTogglePreferredTypeVisible(false)
  await page.closeModal()

  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

smartAccountTest('it should switch to its eoa and sign', async () => {
  await page.openAccount()
  await page.openProfileView()
  await page.openSettings()

  await page.togglePreferredAccountType()
  await validator.expectChangePreferredAccountToShow(SMART_ACCOUNT)

  await page.closeModal()

  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()

  const signature = await page.getSignature()
  const address = await page.getAddress()
  const chainId = await page.getChainId()

  await validator.expectValidSignature(signature, address, chainId)
})

smartAccountTest('it should disconnect correctly', async () => {
  await page.openAccount()
  await page.openProfileView()
  await page.openSettings()
  await page.disconnect()
  await validator.expectDisconnected()
})
