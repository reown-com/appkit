import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { ModalWalletValidator } from './shared/validators/ModalWalletValidator'
import { Email } from './shared/utils/email'
import { SECURE_WEBSITE_URL } from './shared/constants'
import { mainnet, polygon, solana, solanaTestnet } from '@reown/appkit-new/networks'
import type { CaipNetworkId } from '@reown/appkit-new'

/* eslint-disable init-declarations */
let page: ModalWalletPage
let validator: ModalWalletValidator
let context: BrowserContext
let browserPage: Page
let email: Email
let tempEmail: string

// -- Setup --------------------------------------------------------------------
const emailTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

emailTest.describe.configure({ mode: 'serial' })

emailTest.beforeAll(async ({ browser, library }) => {
  context = await browser.newContext()
  browserPage = await context.newPage()

  page = new ModalWalletPage(browserPage, library, 'default')
  validator = new ModalWalletValidator(browserPage)

  await page.page.context().setOffline(false)
  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  email = new Email(mailsacApiKey)
  tempEmail = await email.getEmailAddressToUse()

  // Iframe should not be injected until needed
  validator.expectSecureSiteFrameNotInjected()
  await page.emailFlow(tempEmail, context, mailsacApiKey)

  await validator.expectConnected()
})

emailTest.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
emailTest('it should sign', async () => {
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailTest('it should upgrade wallet', async () => {
  const walletUpgradePage = await page.clickWalletUpgradeCard(context)
  expect(walletUpgradePage.url()).toContain(SECURE_WEBSITE_URL)
  await walletUpgradePage.close()
  await page.closeModal()
})

emailTest('it should reject sign', async () => {
  await page.sign()
  await page.rejectSign()
  await validator.expectRejectedSign()
})

emailTest('it should switch network and sign', async ({ library }) => {
  let targetChain = library === 'solana' ? 'Solana Testnet' : 'Polygon'
  let caipNetworkId: number | string = library === 'solana' ? solanaTestnet.id : polygon.id

  await page.switchNetwork(targetChain)
  await validator.expectSwitchedNetworkOnNetworksView(targetChain)
  await page.closeModal()
  await validator.expectCaipAddressHaveCorrectNetworkId(caipNetworkId as CaipNetworkId)

  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()

  targetChain = library === 'solana' ? 'Solana' : 'Ethereum'
  caipNetworkId = library === 'solana' ? solana.id : mainnet.id
  await page.switchNetwork(targetChain)
  await validator.expectSwitchedNetworkOnNetworksView(targetChain)
  await page.closeModal()
  await validator.expectCaipAddressHaveCorrectNetworkId(caipNetworkId as CaipNetworkId)

  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailTest('it should show names feature only for EVM networks', async ({ library }) => {
  await page.goToSettings()
  await validator.expectNamesFeatureVisible(library !== 'solana')
  await page.closeModal()
})

emailTest('it should show loading on page refresh', async () => {
  await page.page.reload()
  await validator.expectConnectButtonLoading()
  await validator.expectAccountButtonReady()
})

emailTest('it should show snackbar error if failed to fetch token balance', async () => {
  await page.page.context().setOffline(true)
  await page.openAccount()
  await validator.expectSnackbar('Token Balance Unavailable')
  await page.closeModal()
})

emailTest('it should disconnect correctly', async () => {
  await page.page.context().setOffline(false)
  await page.goToSettings()
  await page.disconnect()
  await validator.expectDisconnected()
})

emailTest('it should abort request if it takes more than 30 seconds', async () => {
  await page.page.context().setOffline(true)
  await page.loginWithEmail(tempEmail, false)
  await page.page.waitForTimeout(30_000)
  await validator.expectSnackbar('Something went wrong')
})
