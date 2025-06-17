import { type BrowserContext, expect, test } from '@playwright/test'

import { SECURE_WEBSITE_URL } from '@reown/appkit-testing'

import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

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
  await page.emailFlow({ emailAddress: tempEmail, context, mailsacApiKey })
  await page.promptSiwe()
  await page.approveSign()

  await validator.expectConnected()
  await validator.expectAuthenticated()
})

smartAccountSiweTest.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
smartAccountSiweTest('it should sign with siwe + smart account', async ({ library }) => {
  const namespace = library === 'solana' ? 'solana' : 'eip155'

  await page.sign(namespace)
  await page.approveSign()
  await validator.expectAcceptedSign()
})

smartAccountSiweTest('it should upgrade wallet', async ({ library }) => {
  const walletUpgradePage = await page.clickWalletUpgradeCard(context, library)
  expect(walletUpgradePage.url()).toContain(SECURE_WEBSITE_URL)
  await walletUpgradePage.close()
  await page.closeModal()
})

smartAccountSiweTest(
  'it should switch to a smart account enabled network and sign',
  async ({ library }) => {
    const targetChain = 'Base'
    const namespace = library === 'solana' ? 'solana' : 'eip155'

    await page.switchNetwork(targetChain)
    await validator.expectSwitchedNetworkWithNetworkView()
    await page.promptSiwe()
    await page.approveSign()
    await validator.expectConnected()
    await validator.expectAuthenticated()
    await page.page.waitForTimeout(1000)

    await page.sign(namespace)
    await page.approveSign()
    await validator.expectAcceptedSign()
  }
)

smartAccountSiweTest(
  'it should switch to a not enabled network and sign with EOA',
  async ({ library }) => {
    const targetChain = 'Aurora'
    const namespace = library === 'solana' ? 'solana' : 'eip155'

    await page.switchNetwork(targetChain)
    await page.promptSiwe()
    await page.approveSign()
    await validator.expectConnected()
    await validator.expectAuthenticated()
    await page.page.waitForTimeout(1000)

    await page.openAccount()
    // Shouldn't show the toggle on a non enabled network
    await validator.expectTogglePreferredTypeVisible(false)
    await page.closeModal()

    await page.sign(namespace)
    await page.approveSign()
    await validator.expectAcceptedSign()
  }
)

smartAccountSiweTest('it should disconnect correctly', async () => {
  await page.openAccount()
  await page.openProfileView()
  await page.disconnect()
  await validator.expectDisconnected()
})
