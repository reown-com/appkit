import { test, type BrowserContext } from '@playwright/test'
import { ModalPage } from '../shared/pages/ModalPage'
import { ModalValidator } from '../shared/validators/ModalValidator'
import { WalletPage } from '../shared/pages/WalletPage'
import { WalletValidator } from '../shared/validators/WalletValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let walletPage: WalletPage
let walletValidator: WalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, 'multichain-ethers-solana-siwe', 'default')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(browserPage)
  walletValidator = new WalletValidator(walletPage.page)

  await modalPage.load()
  await modalPage.load()
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
})

test.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
test('it should switch networks and sign siwe', async () => {
  const chainName = 'Polygon'
  await modalPage.switchNetwork(chainName)
  await modalValidator.expectUnauthenticated()
  await modalPage.promptSiwe()
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAuthenticated()

  // -- Sign ------------------------------------------------------------------
  await modalPage.sign()
  await walletValidator.expectReceivedSign({ chainName })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()
})

test('it should switch to Solana and validate chain title', async () => {
  const chainName = 'Solana'
  await modalPage.switchNetwork(chainName)
  await modalValidator.expectSwitchChainView(chainName.toLocaleLowerCase())
})
