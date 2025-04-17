import { type BrowserContext, test } from '@playwright/test'

import { BASE_URL } from './shared/constants'
import { CloudAuthModalPage } from './shared/pages/CloudAuthModalPage'
import { WalletPage } from './shared/pages/WalletPage'
import { CloudAuthModalValidator } from './shared/validators/CloudAuthModalValidator'

/* eslint-disable init-declarations */
let modalPage: CloudAuthModalPage
let modalValidator: CloudAuthModalValidator
let walletPage: WalletPage
let context: BrowserContext
/* eslint-enable init-declarations */

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()

  modalPage = new CloudAuthModalPage(await context.newPage(), 'library', 'default')
  modalValidator = new CloudAuthModalValidator(modalPage.page)
  walletPage = new WalletPage(await context.newPage())

  await walletPage.load()
  await modalPage.page.goto(`${BASE_URL}library/siwx-cloud-auth`)
  await modalValidator.expectDisconnected()
})

test.afterAll(async () => {
  await context.close()
})

test('should have no session account', async () => {
  await modalValidator.expectEmptySession()
})

test('should be authenticated', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
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
