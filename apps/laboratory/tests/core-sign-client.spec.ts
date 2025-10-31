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
const signClientTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

signClientTest.describe.configure({ mode: 'serial' })

signClientTest.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  // Navigate to sign-client page
  await browserPage.goto(`${BASE_URL}appkit-core/sign-client/`)

  modalPage = new ModalPage(browserPage, 'library', 'core-sign-client')
  walletPage = new WalletPage(await context.newPage())
  walletValidator = new WalletValidator(walletPage.page)
  validator = new ModalWalletValidator(browserPage)

  await walletPage.load()

  // Connect button for sign-client page
  const connectButton = browserPage.getByTestId('connect-button')
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

signClientTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
signClientTest('it should be connected with sign client', async () => {
  await expect(modalPage.page.getByTestId('disconnect-button')).toBeVisible()
  await expect(modalPage.page.getByText('Account:')).toBeVisible()
  await expect(modalPage.page.getByText('Network:')).toBeVisible()
})

signClientTest('it should sign message with sign client', async () => {
  await modalPage.page.getByTestId('sign-message-button').click()
  await walletValidator.expectReceivedSign({ chainName: 'Ethereum' })
  await walletPage.handleRequest({ accept: true })
  await validator.expectAcceptedSign()
})

signClientTest('it should switch networks with sign client', async () => {
  // Switch to Polygon network
  await modalPage.page.getByRole('button', { name: 'Polygon' }).click()

  // Verify network switched
  await expect(modalPage.page.getByText('Network: eip155:137')).toBeVisible()
})

signClientTest('it should sign message after network switch with sign client', async () => {
  await modalPage.page.getByTestId('sign-message-button').click()
  await walletValidator.expectReceivedSign({ chainName: 'Polygon' })
  await walletPage.handleRequest({ accept: true })
  await validator.expectAcceptedSign()
})

signClientTest('it should stay connected after page refresh with sign client', async () => {
  await modalPage.page.reload()
  await expect(modalPage.page.getByTestId('disconnect-button')).toBeVisible()
  await expect(modalPage.page.getByText('Account:')).toBeVisible()
})

signClientTest('it should reject sign message with sign client', async () => {
  await modalPage.page.getByTestId('sign-message-button').click()
  await walletValidator.expectReceivedSign({ chainName: 'Ethereum' })
  await walletPage.handleRequest({ accept: false })
  await validator.expectRejectedSign()
})

signClientTest('it should switch between various networks with sign client', async () => {
  // Switch to Ethereum network
  await modalPage.page.getByRole('button', { name: 'Ethereum' }).click()
  await expect(modalPage.page.getByText('Network: eip155:1')).toBeVisible()

  // Switch to Solana network
  await modalPage.page.getByRole('button', { name: 'Solana' }).click()
  await expect(modalPage.page.getByText(`Network: solana:`)).toBeVisible()

  // Switch to Bitcoin network
  await modalPage.page.getByRole('button', { name: 'Bitcoin' }).click()
  await expect(modalPage.page.getByText(`Network: bip122:`)).toBeVisible()
})

signClientTest('it should disconnect from sign client', async () => {
  await modalPage.page.getByTestId('disconnect-button').click()
  await expect(modalPage.page.getByTestId('connect-button')).toBeVisible()
})
