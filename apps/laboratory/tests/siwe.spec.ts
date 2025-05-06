import { type BrowserContext, type Page, test } from '@playwright/test'

import { ModalPage } from './shared/pages/ModalPage'
import { WalletPage } from './shared/pages/WalletPage'
import { ModalValidator } from './shared/validators/ModalValidator'
import { WalletValidator } from './shared/validators/WalletValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let walletPage: WalletPage
let walletValidator: WalletValidator
let context: BrowserContext
let browserPage: Page
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const siweWalletTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

siweWalletTest.describe.configure({ mode: 'serial' })

siweWalletTest.beforeAll(async ({ browser, library }) => {
  context = await browser.newContext()
  browserPage = await context.newPage()
  await context.clearCookies()

  modalPage = new ModalPage(browserPage, library, 'siwe')
  walletPage = new WalletPage(await context.newPage())
  walletValidator = new WalletValidator(walletPage.page)
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
})

siweWalletTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
siweWalletTest('it should be authenticated', async () => {
  await modalValidator.expectOnSignInEventCalled(false)
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
  await modalValidator.expectAuthenticated()
  await modalValidator.expectOnSignInEventCalled(true)
})

siweWalletTest('it should require re-authentication when switching networks', async () => {
  await modalPage.switchNetwork('Polygon')
  await modalValidator.expectUnauthenticated()
  await modalValidator.expectOnSignOutEventCalled(true)
  await modalPage.promptSiwe()
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAuthenticated()
})

siweWalletTest('it should disconnect when cancel siwe from AppKit', async () => {
  await modalPage.switchNetwork('Ethereum')
  await modalValidator.expectUnauthenticated()
  await modalPage.cancelSiwe()
  await modalValidator.expectDisconnected()
  await modalValidator.expectUnauthenticated()
  await walletValidator.expectSessionCard({ visible: false })
})

siweWalletTest('it should be authenticated when refresh page', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
  // Wait to be authenticated before reloading the page
  await modalValidator.expectAuthenticated()
  await modalPage.page.reload()
  await modalValidator.expectConnected()
  await modalValidator.expectAuthenticated()
  await modalValidator.expectOnSignInEventCalled(false)
  await modalPage.sign()
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await modalValidator.expectUnauthenticated()
  await walletValidator.expectSessionCard({ visible: false })
})

siweWalletTest('it should be unauthenticated when disconnect', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await modalValidator.expectUnauthenticated()
  await walletValidator.expectSessionCard({ visible: false })
})
