import { type BrowserContext, expect } from '@playwright/test'

import { SECURE_WEBSITE_URL } from '@reown/appkit-testing'

import { type TimingRecords, timingFixture } from './shared/fixtures/timing-fixture'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import { afterEachCanary, getCanaryTagAndAnnotation } from './shared/utils/metrics'
import { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

/* eslint-disable init-declarations */
let page: ModalWalletPage
let validator: ModalWalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const emailSiweTest = timingFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

emailSiweTest.describe.configure({ mode: 'serial' })

const beforeAllTimingRecords: TimingRecords = []
emailSiweTest.beforeAll(async ({ browser, library }) => {
  emailSiweTest.setTimeout(300000)

  const start = new Date()
  context = await browser.newContext()
  const browserPage = await context.newPage()
  page = new ModalWalletPage(browserPage, library, 'siwe')
  validator = new ModalWalletValidator(browserPage)

  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)

  const getEmailAddressToUse = new Date()
  const tempEmail = await email.getEmailAddressToUse()
  beforeAllTimingRecords.push({
    item: 'getEmailAddressToUse',
    timeMs: new Date().getTime() - getEmailAddressToUse.getTime()
  })

  // Iframe should not be injected until needed
  validator.expectSecureSiteFrameNotInjected()

  const emailFlow = new Date()
  await page.emailFlow({
    emailAddress: tempEmail,
    context,
    mailsacApiKey,
    timingRecords: beforeAllTimingRecords
  })
  beforeAllTimingRecords.push({
    item: 'emailFlow',
    timeMs: new Date().getTime() - emailFlow.getTime()
  })

  const promptSiwe = new Date()
  await page.promptSiwe()
  beforeAllTimingRecords.push({
    item: 'promptSiwe',
    timeMs: new Date().getTime() - promptSiwe.getTime()
  })

  const approveSign = new Date()
  await page.approveSign()
  beforeAllTimingRecords.push({
    item: 'approveSign',
    timeMs: new Date().getTime() - approveSign.getTime()
  })

  const startExpectConnected = new Date()
  await validator.expectConnected()
  await validator.expectAuthenticated()
  beforeAllTimingRecords.push({
    item: 'expectConnected',
    timeMs: new Date().getTime() - startExpectConnected.getTime()
  })

  beforeAllTimingRecords.push({
    item: 'beforeAll',
    timeMs: new Date().getTime() - start.getTime()
  })
})

emailSiweTest.afterAll(async () => {
  await page.page.close()
})

emailSiweTest.afterEach(async ({ browserName, timingRecords }, testInfo) => {
  if (browserName === 'firefox') {
    return
  }
  await afterEachCanary(testInfo, timingRecords)
})

// -- Tests --------------------------------------------------------------------
emailSiweTest(
  'it should sign',
  getCanaryTagAndAnnotation('HappyPath.email-sign'),
  async ({ library, timingRecords }) => {
    const namespace = library === 'solana' ? 'solana' : 'eip155'
    await page.sign(namespace)
    await page.approveSign()
    await validator.expectAcceptedSign()
    timingRecords.push(...beforeAllTimingRecords)
  }
)

emailSiweTest('it should upgrade wallet', async () => {
  const walletUpgradePage = await page.clickWalletUpgradeCard(context)
  expect(walletUpgradePage.url()).toContain(SECURE_WEBSITE_URL)
  await walletUpgradePage.close()
  await page.closeModal()
})

emailSiweTest('it should reject sign', async ({ library }) => {
  const namespace = library === 'solana' ? 'solana' : 'eip155'
  await page.sign(namespace)
  await page.rejectSign()
  await validator.expectRejectedSign()
})

emailSiweTest('it should switch network and sign', async ({ library }) => {
  let targetChain = 'Polygon'
  const namespace = library === 'solana' ? 'solana' : 'eip155'

  await page.switchNetwork(targetChain)
  await page.promptSiwe()
  await page.approveSign()
  await validator.expectAuthenticated()
  await page.page.waitForTimeout(1000)

  await page.sign(namespace)
  await page.approveSign()
  await validator.expectAcceptedSign()

  targetChain = 'Ethereum'
  await page.switchNetwork(targetChain)
  await page.promptSiwe()
  await page.approveSign()
  await validator.expectAuthenticated()
  await page.page.waitForTimeout(1000)

  await page.sign(namespace)
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailSiweTest('it should fallback to the last session when cancel siwe from AppKit', async () => {
  const targetChain = 'Polygon'
  await page.switchNetwork(targetChain)
  await page.promptSiwe({ cancel: true })
  await validator.expectNetworkButton('Ethereum')
  await validator.expectAuthenticated()
  await page.page.waitForTimeout(1000)
})

emailSiweTest('it should disconnect correctly', async () => {
  await page.goToProfileWalletsView()
  await page.clickProfileWalletsMoreButton()
  await page.disconnect()
  await validator.expectDisconnected()
})
