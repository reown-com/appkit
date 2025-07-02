import { type BrowserContext, expect, test } from '@playwright/test'

import { BASE_URL, WalletPage } from '@reown/appkit-testing'

import { ReownAuthenticationModalPage } from './shared/pages/ReownAuthenticationModalPage'
import { ReownAuthenticationModalValidator } from './shared/validators/ReownAuthenticationModalValidator'

/* eslint-disable init-declarations */
let modalPage: ReownAuthenticationModalPage
let modalValidator: ReownAuthenticationModalValidator
let walletPage: WalletPage
let context: BrowserContext
/* eslint-enable init-declarations */

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()

  modalPage = new ReownAuthenticationModalPage(await context.newPage(), 'library', 'default')
  modalValidator = new ReownAuthenticationModalValidator(modalPage.page)
  walletPage = new WalletPage(await context.newPage())

  await walletPage.load()
  await modalPage.page.goto(`${BASE_URL}library/reown-authentication`)
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
  await modalPage.promptSiwe()
  await walletPage.handleRequest({ accept: true })
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
  await modalPage.openModal()
  await modalPage.disconnect()
  await modalValidator.expectEmptySession()
})
