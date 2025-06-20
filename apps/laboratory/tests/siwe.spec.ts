import { type BrowserContext, type Page, test } from '@playwright/test'

import { WalletPage, WalletValidator } from '@reown/appkit-testing'

import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

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
  await modalPage.promptSiwe()
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAuthenticated()
})

siweWalletTest('it should fallback to the last session when cancel siwe from AppKit', async () => {
  await modalPage.switchNetwork('Ethereum')
  await modalPage.cancelSiwe()
  await modalValidator.expectNetworkButton('Polygon')
  await modalValidator.expectAuthenticated()
})

siweWalletTest('it should be authenticated when refresh page', async () => {
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
