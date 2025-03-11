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

  modalPage = new ModalPage(browserPage, 'multichain-all', 'default')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(browserPage)
  walletValidator = new WalletValidator(walletPage.page)

  await modalPage.load()
  await modalPage.qrCodeFlow(modalPage, walletPage)
})

test.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
test('should connect to all chains', async () => {
  await modalValidator.expectAccountButtonReady('eip155')
  await modalValidator.expectAccountButtonReady('solana')
  await modalValidator.expectAccountButtonReady('bip122')
})

test('should sign message for each chain', async () => {
  await modalPage.sign('eip155')
  await walletValidator.expectReceivedSign({ chainName: 'Ethereum' })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()

  await modalPage.sign('solana')
  await walletValidator.expectReceivedSign({ chainName: 'Solana' })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()

  /**
   * Bitcoin sign message has an issue on the sample wallet where sample wallet freezing after clicking approve button.
   * This is not reproducible on the non-test environment. Only happening with PW tests. Will investigate
   */
})

test('should switch network as expected', async () => {
  await modalPage.switchNetwork('Polygon')
  await modalValidator.expectSwitchedNetwork('Polygon')
  await modalPage.closeModal()

  await modalPage.switchNetwork('Solana')
  await modalValidator.expectSwitchedNetwork('Solana')
  await modalPage.closeModal()

  await modalPage.switchNetwork('Bitcoin')
  await modalValidator.expectSwitchedNetwork('Bitcoin')
  await modalPage.closeModal()
})

test('should switch network when clicking on the account buttons', async () => {
  await modalPage.openAccount('eip155')
  await modalValidator.expectSwitchChainWithNetworkButton('Polygon')
  await modalPage.closeModal()

  await modalPage.openAccount('solana')
  await modalValidator.expectSwitchChainWithNetworkButton('Solana')
  await modalPage.closeModal()

  await modalPage.openAccount('bip122')
  await modalValidator.expectSwitchChainWithNetworkButton('Bitcoin')
  await modalPage.closeModal()
})

test('should disconnect from all chains', async () => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected('eip155')
  await modalValidator.expectDisconnected('solana')
  await modalValidator.expectDisconnected('bip122')
})
