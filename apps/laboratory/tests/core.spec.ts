import { type BrowserContext, test } from '@playwright/test'

import { BASE_URL } from './shared/constants'
import { expect } from './shared/fixtures/w3m-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { WalletPage } from './shared/pages/WalletPage'
import { WalletValidator } from './shared/validators/WalletValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let walletPage: WalletPage
let walletValidator: WalletValidator
let context: BrowserContext
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
  await browserPage.goto(`${BASE_URL}core/`)

  modalPage = new ModalPage(browserPage, 'library', 'core')
  walletPage = new WalletPage(await context.newPage())
  walletValidator = new WalletValidator(walletPage.page)

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
  await expect(browserPage.getByTestId('disconnect-button')).toBeVisible()
})

coreTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
coreTest('it should be connected to core page', async () => {
  await expect(modalPage.page.getByTestId('disconnect-button')).toBeVisible()
})

coreTest('it should sign message on core page', async () => {
  await modalPage.sign()
  await walletValidator.expectReceivedSign({ chainName: 'Ethereum' })
  await walletPage.handleRequest({ accept: true })
  await expect(modalPage.page.getByText('Message signed successfully')).toBeVisible()
})

coreTest('it should switch networks on core page', async () => {
  await modalPage.openModal()
  await modalPage.openNetworks()
  await modalPage.switchNetwork('Polygon')
  await expect(modalPage.page.getByText('Polygon')).toBeVisible()
})

coreTest('it should sign message after network switch', async () => {
  await modalPage.sign()
  await walletValidator.expectReceivedSign({ chainName: 'Polygon' })
  await walletPage.handleRequest({ accept: true })
  await expect(modalPage.page.getByText('Message signed successfully')).toBeVisible()
})

coreTest('it should stay connected after page refresh', async () => {
  await modalPage.page.reload()
  await expect(modalPage.page.getByTestId('account-button')).toBeVisible()
})

coreTest('it should reject sign message', async () => {
  await modalPage.sign()
  await walletValidator.expectReceivedSign({ chainName: 'Polygon' })
  await walletPage.handleRequest({ accept: false })
  await expect(modalPage.page.getByText('Failed to sign')).toBeVisible()
})

coreTest('it should switch between various networks', async () => {
  await modalPage.openModal()
  await modalPage.openNetworks()

  // Switch to Ethereum network
  await modalPage.switchNetwork('Ethereum')
  await modalPage.closeModal()

  await modalPage.openModal()
  await modalPage.openNetworks()

  // Switch to Solana network
  await modalPage.switchNetwork('Solana')
  await modalPage.closeModal()

  await modalPage.openModal()
  await modalPage.openNetworks()

  // Switch to Bitcoin network
  await modalPage.switchNetwork('Bitcoin')
  await modalPage.closeModal()
})

coreTest('it should disconnect from core page', async () => {
  await modalPage.disconnect()
  await expect(modalPage.page.getByTestId('connect-button')).toBeVisible()
})
