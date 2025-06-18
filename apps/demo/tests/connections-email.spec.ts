import { test } from '@playwright/test'

import { DemoPage } from './pages/DemoPage'
import { Email } from './utils/email'
import { DemoPageValidator } from './validators/DemoPageValidator'

/* eslint-disable init-declarations */
let demoPage: DemoPage
let validator: DemoPageValidator
let email: Email
let tempEmail: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const browserPage = await context.newPage()

  demoPage = new DemoPage(browserPage)
  validator = new DemoPageValidator(browserPage)

  await demoPage.load()
})

test.afterAll(async () => {
  await demoPage.page.close()
})

// Test case 1: Disable chain with chain option
test('should connect with email as expected', async ({ context }) => {
  const mailsacApiKey = process.env['MAILSAC_API_KEY']

  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }

  email = new Email(mailsacApiKey)
  tempEmail = await email.getEmailAddressToUse()

  // Iframe should not be injected until needed
  validator.expectSecureSiteFrameNotInjected()
  await demoPage.emailFlow({
    emailAddress: tempEmail,
    context,
    mailsacApiKey,
    clickConnectButton: false
  })

  await validator.expectConnected()
})

test('should stay connected after page refresh', async () => {
  await demoPage.page.reload()
  await validator.expectConnected()
})

test('should switch network as expected', async () => {
  await demoPage.openNetworks()
  await demoPage.switchNetwork('Solana')
  await validator.expectSwitchedNetworkOnNetworksView('Solana')
  await demoPage.goBack()
  await validator.expectSwitchedNetworkOnHeaderButton('Solana')

  await demoPage.openNetworks()
  await demoPage.switchNetwork('Ethereum')
  await validator.expectSwitchedNetworkOnNetworksView('Ethereum')
  await demoPage.goBack()
  await validator.expectSwitchedNetworkOnHeaderButton('Ethereum')
})
