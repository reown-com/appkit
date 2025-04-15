import { type BrowserContext, test } from '@playwright/test'

import { ModalPage } from '../shared/pages/ModalPage'
import { WalletPage } from '../shared/pages/WalletPage'
import { ModalValidator } from '../shared/validators/ModalValidator'
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
  await context.clearCookies()

  modalPage = new ModalPage(browserPage, 'multichain-ethers-solana-siwe', 'default')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(browserPage)
  walletValidator = new WalletValidator(walletPage.page)

  await modalPage.load()
  await modalPage.load()
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
  await modalPage.promptSiwe()
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAuthenticated()
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
  await modalPage.page.waitForTimeout(1000)

  // -- Sign ------------------------------------------------------------------
  await modalPage.sign('eip155')
  await walletValidator.expectReceivedSign({ chainName })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()
})

test('it should switch to Solana and validate chain title', async () => {
  const chainName = 'Solana'
  await modalPage.switchNetwork(chainName)
  await modalValidator.expectSwitchedNetworkOnNetworksView(chainName)
})
