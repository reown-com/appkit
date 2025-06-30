import { type BrowserContext, expect, test } from '@playwright/test'

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

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  modalPage = new CloudAuthModalPage(await context.newPage(), 'library', 'default')
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

test.afterAll(async () => {
  await context.close()
})

test('should authenticate', async () => {
  await modalValidator.expectSession()
})

test('should keep session after page reload', async () => {
  await modalPage.page.reload()
  await modalValidator.expectConnected()
  await modalValidator.expectSession()
})

test('should get session account', async () => {
  await modalPage.requestSessionAccount()
  await modalValidator.expectSessionAccount()
})

test('should update session account metadata', async () => {
  const metadata = { username: 'satoshi' }
  await modalPage.updateSessionAccountMetadata(metadata)

  await modalPage.requestSessionAccount()
  const sessionAccount = await modalValidator.expectSessionAccount()
  expect(sessionAccount.appKitAccount.metadata).toMatchObject(metadata)
})

test('should disconnect session account', async () => {
  await modalPage.disconnect()
  await modalValidator.expectEmptySession()
})
