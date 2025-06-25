import { type BrowserContext, test } from '@playwright/test'

import { BASE_URL, WalletPage, WalletValidator } from '@reown/appkit-testing'

import { expect } from './shared/fixtures/w3m-fixture'
import { ModalPage } from './shared/pages/ModalPage'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let walletPage: WalletPage
let walletValidator: WalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const universalProviderTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

universalProviderTest.describe.configure({ mode: 'serial' })

universalProviderTest.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  // Navigate to universal-provider page
  await browserPage.goto(`${BASE_URL}core/universal-provider/`)

  modalPage = new ModalPage(browserPage, 'library', 'core-universal-provider')
  walletPage = new WalletPage(await context.newPage())
  walletValidator = new WalletValidator(walletPage.page)

  await walletPage.load()

  // Connect button for universal-provider page
  const connectButton = browserPage.getByTestId('connect-button')
  await connectButton.click()

  // Get QR code URI and connect from wallet
  const qrCode = browserPage.getByTestId('wui-qr-code')
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

universalProviderTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
universalProviderTest('it should be connected with universal provider', async () => {
  await expect(modalPage.page.getByTestId('disconnect-button')).toBeVisible()
  await expect(modalPage.page.getByText('Account:')).toBeVisible()
  await expect(modalPage.page.getByText('Network:')).toBeVisible()
})

universalProviderTest('it should sign message with universal provider', async () => {
  await modalPage.page.getByTestId('sign-message-button').click()
  await walletValidator.expectReceivedSign({ chainName: 'Ethereum' })
  await walletPage.handleRequest({ accept: true })
  await expect(modalPage.page.getByText('Signing Succeeded')).toBeVisible()
})

universalProviderTest('it should switch networks with universal provider', async () => {
  // Switch to Polygon network
  await modalPage.page.getByRole('button', { name: 'Polygon' }).click()

  // Verify network switched
  await expect(modalPage.page.getByText('Network: eip155:137')).toBeVisible()
})

universalProviderTest('it should sign message after network switch with UP', async () => {
  await modalPage.page.getByTestId('sign-message-button').click()
  await walletValidator.expectReceivedSign({ chainName: 'Polygon' })
  await walletPage.handleRequest({ accept: true })
  await expect(modalPage.page.getByText('Signing Succeeded')).toBeVisible()
})

universalProviderTest('it should stay connected after page refresh with UP', async () => {
  await modalPage.page.reload()
  await expect(modalPage.page.getByTestId('disconnect-button')).toBeVisible()
  await expect(modalPage.page.getByText('Account:')).toBeVisible()
})

universalProviderTest('it should reject sign message with UP', async () => {
  await modalPage.page.getByTestId('sign-message-button').click()
  await walletValidator.expectReceivedSign({ chainName: 'Ethereum' })
  await walletPage.handleRequest({ accept: false })
  await expect(modalPage.page.getByText('Failed to sign')).toBeVisible()
})

universalProviderTest('it should switch between various networks with UP', async () => {
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

universalProviderTest('it should disconnect with UP', async () => {
  await modalPage.page.getByTestId('disconnect-button').click()
  await expect(modalPage.page.getByTestId('connect-button')).toBeVisible()
})
