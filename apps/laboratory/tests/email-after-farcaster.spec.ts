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
const emailTestAfterFarcaster = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

emailTestAfterFarcaster.describe.configure({ mode: 'serial' })

emailTestAfterFarcaster.beforeAll(async ({ browser, library }) => {
  emailTestAfterFarcaster.setTimeout(300000)
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
  await page.abortLoginWithFarcaster()
  await page.emailFlow({ emailAddress: tempEmail, context, mailsacApiKey })

  await validator.expectConnected()
})

emailTestAfterFarcaster.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
emailTestAfterFarcaster('it should sign after abort login with farcaster', async () => {
  await page.sign('eip155')
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailTestAfterFarcaster('it should upgrade wallet after abort login with farcaster', async () => {
  const walletUpgradePage = await page.clickWalletUpgradeCard(context)
  expect(walletUpgradePage.url()).toContain(SECURE_WEBSITE_URL)
  await walletUpgradePage.close()
  await page.closeModal()
})

emailTestAfterFarcaster('it should reject sign after abort login with farcaster', async () => {
  await page.sign('eip155')
  await page.rejectSign()
  await validator.expectRejectedSign()
})

emailTestAfterFarcaster(
  'it should switch network and sign after abort login with farcaster',
  async ({ library }) => {
    let targetChain = library === 'solana' ? 'Solana Testnet' : 'Polygon'
    let caipNetworkId: number | string = library === 'solana' ? solanaTestnet.id : polygon.id

    await page.switchNetwork(targetChain)
    await validator.expectSwitchedNetworkOnNetworksView(targetChain)
    await page.closeModal()
    await validator.expectCaipAddressHaveCorrectNetworkId(caipNetworkId as CaipNetworkId)

    await page.sign('eip155')
    await page.approveSign()
    await validator.expectAcceptedSign()

    targetChain = library === 'solana' ? 'Solana' : 'Ethereum'
    caipNetworkId = library === 'solana' ? solana.id : mainnet.id
    await page.switchNetwork(targetChain)
    await validator.expectSwitchedNetworkOnNetworksView(targetChain)
    await page.closeModal()
    await validator.expectCaipAddressHaveCorrectNetworkId(caipNetworkId as CaipNetworkId)

    await page.sign('eip155')
    await page.approveSign()
    await validator.expectAcceptedSign()
  }
)

emailTestAfterFarcaster(
  'it should show names feature only for EVM networks after abort login with farcaster',
  async ({ library }) => {
    await page.goToSettings()
    await validator.expectNamesFeatureVisible(library !== 'solana')
    await page.closeModal()
  }
)

emailTestAfterFarcaster(
  'it should show loading on page refresh after abort login with farcaster',
  async () => {
    await page.page.reload()
    /*
     * Disable loading animation check as reload happens before the page is loaded
     * TODO: figure out how to validate the loader before the page is loaded
     * await validator.expectConnectButtonLoading()
     */
    await validator.expectAccountButtonReady()
  }
)

emailTestAfterFarcaster(
  'it should disconnect correctly after abort login with farcaster',
  async () => {
    await page.goToSettings()
    await page.disconnect()
    await validator.expectDisconnected()
  }
)

emailTestAfterFarcaster(
  'it should abort embedded wallet flow if it takes more than 2 minutes after abort login with farcaster',
  async () => {
    await page.page.clock.install()
    await page.page.context().setOffline(true)
    await page.loginWithEmail(tempEmail, false)
    await page.page.clock.runFor(120_000)
    await validator.expectAlertBarText('Embedded Wallet Request Timed Out')
    await page.page.context().setOffline(false)
  }
)
