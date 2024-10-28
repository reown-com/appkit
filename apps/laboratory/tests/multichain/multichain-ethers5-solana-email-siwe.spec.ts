import { test, type BrowserContext } from '@playwright/test'
import { ModalWalletPage } from '../shared/pages/ModalWalletPage'
import { ModalWalletValidator } from '../shared/validators/ModalWalletValidator'
import { Email } from '../shared/utils/email'

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

  page = new ModalWalletPage(browserPage, 'multichain-ethers5-solana-siwe', 'default')
  validator = new ModalWalletValidator(browserPage)

  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)
  const tempEmail = await email.getEmailAddressToUse()
  await page.emailFlow(tempEmail, context, mailsacApiKey)
  await page.promptSiwe()
  await page.approveSign()

  await validator.expectConnected()
  await validator.expectAuthenticated()
})

test.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
test('it should switch networks and sign', async () => {
  const chainName = 'Polygon'

  await page.switchNetwork(chainName)
  await validator.expectUnauthenticated()
  await page.promptSiwe()
  await page.approveSign()

  // -- Sign ------------------------------------------------------------------
  await page.sign()
  await validator.expectReceivedSign({ chainName })
  await page.approveSign()
  await validator.expectAcceptedSign()
})

test('it should switch to different namespace', async () => {
  const chainName = 'Solana'

  await page.switchNetwork(chainName)
  await page.openNetworks()
  await validator.expectSwitchedNetwork(chainName)
  await page.closeModal()

  // -- Sign ------------------------------------------------------------------
  await page.sign()
  await validator.expectReceivedSign({ chainName })
  await page.approveSign()
  await validator.expectAcceptedSign()
})
