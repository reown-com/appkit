import { type BrowserContext, type Page, expect, test } from '@playwright/test'

import type { CaipNetworkId } from '@reown/appkit'
import { mainnet, polygon, solana, solanaTestnet } from '@reown/appkit/networks'

import { SECURE_WEBSITE_URL } from './shared/constants'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

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
  await page.emailFlow({ emailAddress: tempEmail, context, mailsacApiKey })

  await validator.expectConnected()
})

emailTest.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
emailTest('it should show user info', async () => {
  await validator.expectEmail()
  await validator.expectAccountType()
  await validator.expectSmartAccountStatus()
})

emailTest('it should sign', async () => {
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailTest('it should upgrade wallet', async ({ library }) => {
  const walletUpgradePage = await page.clickWalletUpgradeCard(context, library)
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

emailTest('should throw an error if modal is closed while signing', async () => {
  await page.sign()
  await page.closeModal()
  await validator.expectRejectedSign()
})

emailTest('it should show names feature only for EVM networks', async ({ library }) => {
  if (library === 'solana') {
    await page.openAccount()
    await page.openProfileView()
  } else {
    await page.goToSettings()
  }
  /*
   * There are cases that AppKit tries to close while the modal is animating to the next view
   * So we need to wait for 300ms to ensure the names feature is visible
   */
  await page.page.waitForTimeout(300)
  await validator.expectNamesFeatureVisible(library !== 'solana')
  await page.closeModal()
})

emailTest('it should show loading on page refresh', async () => {
  await page.page.reload()
  /*
   * Disable loading animation check as reload happens before the page is loaded
   * TODO: figure out how to validate the loader before the page is loaded
   * await validator.expectConnectButtonLoading()
   */
  await validator.expectAccountButtonReady()
})

emailTest('it should disconnect correctly', async ({ library }) => {
  if (library === 'solana') {
    await page.openAccount()
    await page.openProfileView()
  } else {
    await page.goToSettings()
  }
  await page.disconnect()
  await validator.expectDisconnected()
})

emailTest('it should abort embedded wallet flow if it takes more than 2 minutes', async () => {
  await page.page.clock.install()
  await page.page.context().setOffline(true)
  await page.loginWithEmail(tempEmail, false)
  await page.page.clock.runFor(120_000)
  await validator.expectAlertBarText('Embedded Wallet Request Timed Out')
  await page.page.context().setOffline(false)
})
