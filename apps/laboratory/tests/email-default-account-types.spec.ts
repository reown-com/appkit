import { type BrowserContext, type Page, test } from '@playwright/test'

import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import { EOA, ModalWalletValidator, SMART_ACCOUNT } from './shared/validators/ModalWalletValidator'

/* eslint-disable init-declarations */
let page: ModalWalletPage
let validator: ModalWalletValidator
let context: BrowserContext
let browserPage: Page
let email: Email
let tempEmail: string
let mailsacApiKey: string | undefined

// -- Setup --------------------------------------------------------------------
const emailTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

emailTest.describe.configure({ mode: 'serial' })

emailTest.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  browserPage = await context.newPage()
  page = new ModalWalletPage(browserPage, 'default-account-types-sa', 'default')
  validator = new ModalWalletValidator(browserPage)
  await page.page.context().setOffline(false)
  await page.load()

  mailsacApiKey = process.env['MAILSAC_API_KEY']
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

emailTest('it should make the default account type as smart account', async ({ library }) => {
  const namespace = library === 'solana' ? 'solana' : 'eip155'

  if (namespace !== 'eip155') {
    return
  }

  await page.goToSettings()
  await validator.expectChangePreferredAccountToShow(EOA)
  await page.closeModal()

  await page.page.reload()
  await validator.expectAccountButtonReady()

  await page.goToSettings()
  await validator.expectChangePreferredAccountToShow(EOA)
  await page.disconnect()
  await validator.expectDisconnected()
})

emailTest('it should show make the default account type as EOA', async ({ library }) => {
  const namespace = library === 'solana' ? 'solana' : 'eip155'

  if (namespace !== 'eip155') {
    return
  }

  page = new ModalWalletPage(browserPage, 'default-account-types-eoa', 'default')
  await page.load()

  // @ts-expect-error - mailsacApiKey is defined
  email = new Email(mailsacApiKey)

  // Iframe should not be injected until needed
  validator.expectSecureSiteFrameNotInjected()
  // @ts-expect-error - mailsacApiKey is defined
  await page.emailFlow({ emailAddress: tempEmail, context, mailsacApiKey })
  await validator.expectConnected()

  await page.goToSettings()
  await validator.expectChangePreferredAccountToShow(SMART_ACCOUNT)
  await page.closeModal()

  await page.page.reload()
  await validator.expectAccountButtonReady()

  await page.goToSettings()
  await validator.expectChangePreferredAccountToShow(SMART_ACCOUNT)
  await page.disconnect()
  await validator.expectDisconnected()
})
