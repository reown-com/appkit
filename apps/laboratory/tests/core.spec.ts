import { type BrowserContext, test } from '@playwright/test'

import { BASE_URL, WalletPage, WalletValidator } from '@reown/appkit-testing'

import { expect } from './shared/fixtures/w3m-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let walletPage: WalletPage
let walletValidator: WalletValidator
let context: BrowserContext
let validator: ModalWalletValidator

/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const coreTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

coreTest.describe.configure({ mode: 'serial' })

coreTest.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  // Navigate to core page
  await browserPage.goto(`${BASE_URL}appkit-core/`)

  modalPage = new ModalPage(browserPage, 'library', 'core')
  walletPage = new WalletPage(await context.newPage())
  walletValidator = new WalletValidator(walletPage.page)
  validator = new ModalWalletValidator(browserPage)

  await walletPage.load()

  // Connect button for core page
  const connectButton = browserPage.getByTestId('w3m-open-hook-button')
  await connectButton.click()

  // Get QR code URI and connect from wallet
  const qrCode = browserPage.locator('wui-qr-code')
  await expect(qrCode).toBeVisible()
  const uri = await qrCode.getAttribute('uri')
  expect(uri).toBeTruthy()

  await walletPage.connectWithUri(uri as string)
  await walletPage.handleSessionProposal({
    reqAccounts: ['1', '2'],
    optAccounts: ['1', '2'],
    accept: true
  })

  // Wait for connection
  await expect(browserPage.getByTestId('disconnect-hook-button')).toBeVisible()
})

coreTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
coreTest('it should be connected', async () => {
  await expect(modalPage.page.getByTestId('disconnect-hook-button')).toBeVisible()
})

coreTest('it should sign message', async () => {
  await modalPage.page.getByTestId('sign-message-button').click()
  await walletValidator.expectReceivedSign({ chainName: 'Ethereum' })
  await walletPage.handleRequest({ accept: true })
  await validator.expectAcceptedSign()
})

coreTest('it should switch networks', async () => {
  // Switch to Polygon network
  const selector = modalPage.page.getByTestId('network-selector')
  await selector.selectOption('137')
  // Verify network switched
  const chainIdInfo = modalPage.page.getByTestId('w3m-chain-id')
  await expect(chainIdInfo).toHaveText('137')
})

coreTest('it should sign message after network switch', async () => {
  await modalPage.page.getByTestId('sign-message-button').click()
  await walletValidator.expectReceivedSign({ chainName: 'Polygon' })
  await walletPage.handleRequest({ accept: true })
  await validator.expectAcceptedSign()
})

coreTest('it should stay connected after page refresh', async () => {
  await modalPage.page.reload()
  await expect(modalPage.page.getByTestId('disconnect-hook-button')).toBeVisible()
})

coreTest('it should reject sign message', async () => {
  await modalPage.page.getByTestId('sign-message-button').click()
  await walletValidator.expectReceivedSign({ chainName: 'Polygon' })
  await walletPage.handleRequest({ accept: false })
  await validator.expectRejectedSign()
})

coreTest('it should switch between various networks', async () => {
  // Switch to Ethereum network
  const selector = modalPage.page.getByTestId('network-selector')
  await selector.selectOption('1')
  let chainIdInfo = modalPage.page.getByTestId('w3m-chain-id')
  await expect(chainIdInfo).toHaveText('1')

  // Switch to Solana network
  await selector.selectOption('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')
  chainIdInfo = modalPage.page.getByTestId('w3m-chain-id')
  await expect(chainIdInfo).toHaveText('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')

  // Switch to Bitcoin network
  await selector.selectOption('000000000019d6689c085ae165831e93')
  chainIdInfo = modalPage.page.getByTestId('w3m-chain-id')
  await expect(chainIdInfo).toHaveText('000000000019d6689c085ae165831e93')
})

coreTest('it should disconnect', async () => {
  await modalPage.page.getByTestId('disconnect-hook-button').click()
  await expect(modalPage.page.getByTestId('w3m-open-hook-button')).toBeVisible()
})
