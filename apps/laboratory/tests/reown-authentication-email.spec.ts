import { type BrowserContext, test } from '@playwright/test'

import { BASE_URL } from '@reown/appkit-testing'

import { ReownAuthenticationModalPage } from './shared/pages/ReownAuthenticationModalPage'
import { Email } from './shared/utils/email'
import { ReownAuthenticationModalValidator } from './shared/validators/ReownAuthenticationModalValidator'

/* eslint-disable init-declarations */
let modalPage: ReownAuthenticationModalPage
let modalValidator: ReownAuthenticationModalValidator
let context: BrowserContext
let email: Email
let tempEmail: string
/* eslint-enable init-declarations */

const cloudAuthEmailTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

cloudAuthEmailTest.describe.configure({ mode: 'serial' })

cloudAuthEmailTest.beforeAll(async ({ browser, library }) => {
  context = await browser.newContext()
  modalPage = new ReownAuthenticationModalPage(await context.newPage(), library, 'default')
  modalValidator = new ReownAuthenticationModalValidator(modalPage.page)

  await modalPage.page.goto(`${BASE_URL}library/reown-authentication`)

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }

  email = new Email(mailsacApiKey)
  tempEmail = await email.getEmailAddressToUse()

  await modalPage.emailFlow({ emailAddress: tempEmail, context, mailsacApiKey })

  await modalValidator.expectConnected()
})

cloudAuthEmailTest('should authenticate', async () => {
  await modalValidator.expectSession()
})

cloudAuthEmailTest('should keep session after page reload', async () => {
  await modalPage.page.reload()
  await modalValidator.expectConnected()
  await modalValidator.expectSession()
})

cloudAuthEmailTest('should get session account', async () => {
  await modalPage.requestSessionAccount()
  await modalValidator.expectSessionAccount()
})

cloudAuthEmailTest('should disconnect session account', async () => {
  await modalPage.disconnectWithHook()
  await modalValidator.expectEmptySession()
})
