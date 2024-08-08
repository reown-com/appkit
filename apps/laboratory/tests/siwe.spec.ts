import { test, type BrowserContext } from '@playwright/test'
import { ModalPage } from './shared/pages/ModalPage'
import { WalletPage } from './shared/pages/WalletPage'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let walletPage: WalletPage
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const siweWalletTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

siweWalletTest.describe.configure({ mode: 'serial' })

siweWalletTest.beforeAll(async ({ browser, library }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'siwe')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
})

siweWalletTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
siweWalletTest('it should be authenticated', async () => {
  await modalValidator.expectAuthenticated()
})

siweWalletTest('it should require re-authentication when switching networks', async () => {
  await modalPage.switchNetwork('Polygon')
  await modalValidator.expectUnauthenticated()
  await modalPage.promptSiwe()
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAuthenticated()
  await modalValidator.expectAccountPageVisible()
  await modalPage.closeModal()
})

siweWalletTest('it should be unauthenticated when disconnect', async () => {
  await modalPage.disconnect()
  await modalValidator.expectUnauthenticated()
})
