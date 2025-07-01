import { type BrowserContext, test } from '@playwright/test'

import { BASE_URL } from '@reown/appkit-testing'

import { CloudAuthModalPage } from './shared/pages/CloudAuthModalPage'
import { Email } from './shared/utils/email'
import { CloudAuthModalValidator } from './shared/validators/CloudAuthModalValidator'

/* eslint-disable init-declarations */
let modalPage: CloudAuthModalPage
let modalValidator: CloudAuthModalValidator
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
  modalPage = new CloudAuthModalPage(await context.newPage(), library, 'default')
  modalValidator = new CloudAuthModalValidator(modalPage.page)

  await modalPage.page.goto(`${BASE_URL}library/siwx-cloud-auth`)

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
