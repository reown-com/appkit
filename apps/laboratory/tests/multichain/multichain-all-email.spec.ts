import { type BrowserContext, test } from '@playwright/test'

import { ModalWalletPage } from '../shared/pages/ModalWalletPage'
import { Email } from '../shared/utils/email'
import { ModalWalletValidator } from '../shared/validators/ModalWalletValidator'

/* eslint-disable init-declarations */
let page: ModalWalletPage
let validator: ModalWalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  page = new ModalWalletPage(browserPage, 'multichain-all', 'default')
  validator = new ModalWalletValidator(browserPage)

  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)
  const tempEmail = await email.getEmailAddressToUse()
  await page.emailFlow({ emailAddress: tempEmail, context, mailsacApiKey })
})

test.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
test('it should be connected to all namespaces at once', async () => {
  await validator.expectAccountButtonReady('eip155')
  await validator.expectBalanceFetched('ETH', 'eip155')
  await validator.expectAccountButtonReady('solana')
  await validator.expectBalanceFetched('SOL', 'solana')
})

test('it refresh page and connect to all namespaces again', async () => {
  await page.page.reload()
  await validator.expectAccountButtonReady('eip155')
  await validator.expectBalanceFetched('ETH', 'eip155')
  await validator.expectAccountButtonReady('solana')
  await validator.expectBalanceFetched('SOL', 'solana')
})

test('it should switch networks between EVM and Solana and maintain connections', async () => {
  // Switch to Polygon and verify
  await page.switchNetwork('Polygon')
  await page.page.waitForTimeout(200)
  await validator.expectSwitchedNetwork('Polygon')
  await page.closeModal()

  // Refresh and verify both chains still connected
  await page.page.reload()
  await validator.expectAccountButtonReady('eip155')
  await validator.expectAccountButtonReady('solana')
  await validator.expectNetworkButton('Polygon')

  // Switch to Solana and verify
  await page.switchNetwork('Solana')
  await page.page.waitForTimeout(200)
  await validator.expectSwitchedNetwork('Solana')
  await page.closeModal()

  // Refresh and verify both chains still connected
  await page.page.reload()
  await validator.expectAccountButtonReady('eip155')
  await validator.expectAccountButtonReady('solana')
  await validator.expectNetworkButton('Solana')
})
