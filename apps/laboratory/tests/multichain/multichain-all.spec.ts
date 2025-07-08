import { type BrowserContext, test } from '@playwright/test'

import { WalletPage, WalletValidator } from '@reown/appkit-testing'

import { ModalPage } from '../shared/pages/ModalPage'
import { ModalValidator } from '../shared/validators/ModalValidator'

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
test('should connect to all namespaces', async () => {
  await modalValidator.expectAccountButtonReady('eip155')
  await modalValidator.expectAccountButtonReady('solana')
  await modalValidator.expectAccountButtonReady('bip122')
})

test('should sign message for each chain', async ({ browser }) => {
  const isFirefox = browser.browserType().name() === 'firefox'

  await modalPage.sign('eip155')
  await walletValidator.expectReceivedSign({ chainName: 'Ethereum' })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()

  await modalPage.sign('solana')
  await walletValidator.expectReceivedSign({ chainName: 'Solana' })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()

  if (!isFirefox) {
    /**
     * Bitcoin sign message has an issue on the sample wallet where sample wallet freezing after clicking approve button.
     * This is happening due to ecpair package that sample wallet is using while signing Bitcoin messages, and only happening with Firefox browser.
     */
    await modalPage.sign('bip122')
    await walletValidator.expectReceivedSignMessage({ message: 'Hello, World!' })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
  }
})

test('should refresh page and expect reconnected', async () => {
  await modalPage.page.reload()
  await modalValidator.expectAccountButtonReady('eip155')
  await modalValidator.expectAccountButtonReady('solana')
  await modalValidator.expectAccountButtonReady('bip122')
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

test('should switch network when clicking custom buttons per namespace', async () => {
  const evmButton = modalPage.page.locator('[data-testid="evm-connect-button"]')
  const solanaButton = modalPage.page.locator('[data-testid="solana-connect-button"]')
  const bitcoinButton = modalPage.page.locator('[data-testid="bitcoin-connect-button"]')

  await evmButton.click()
  await modalValidator.expectAccountButtonReady('eip155')
  await modalPage.closeModal()
  await modalValidator.expectBalanceFetched('POL')

  await solanaButton.click()
  await modalValidator.expectAccountButtonReady('solana')
  await modalPage.closeModal()
  await modalValidator.expectBalanceFetched('SOL')

  await bitcoinButton.click()
  await modalValidator.expectAccountButtonReady('bip122')
  await modalPage.closeModal()
  await modalValidator.expectBalanceFetched('BTC')
})

test('should disconnect from all namespaces', async () => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected('eip155')
  await modalValidator.expectDisconnected('solana')
  await modalValidator.expectDisconnected('bip122')
})

test('should disconnect from all namespaces when try to disconnect only one when connected with wc', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage)

  await modalValidator.expectAccountButtonReady('eip155')
  await modalValidator.expectAccountButtonReady('solana')
  await modalValidator.expectAccountButtonReady('bip122')

  await modalPage.disconnectWithHook('eip155')

  await modalValidator.expectDisconnected('eip155')
  await modalValidator.expectDisconnected('solana')
  await modalValidator.expectDisconnected('bip122')
})
