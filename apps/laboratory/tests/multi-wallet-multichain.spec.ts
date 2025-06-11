/* eslint-disable no-await-in-loop */
import { type Page } from '@playwright/test'

import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { WalletPage } from './shared/pages/WalletPage'
import { Email } from './shared/utils/email'
import { ModalValidator } from './shared/validators/ModalValidator'

// -- Constants ----------------------------------------------------------------
/* eslint-disable init-declarations */
let modal: ModalPage
let validator: ModalValidator
let wallet: WalletPage
let email: Email
let page: Page
let apiKey: string
let tempEmail: string
let walletConnectEvmAddress: string
let walletConnectSolanaAddress: string

// -- Setup --------------------------------------------------------------------
const test = extensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ context }) => {
  apiKey = process.env['MAILSAC_API_KEY'] as string

  if (!apiKey) {
    throw new Error('MAILSAC_API_KEY required')
  }

  page = await context.newPage()
  wallet = new WalletPage(await context.newPage())
  email = new Email(apiKey)
  tempEmail = await email.getEmailAddressToUse()
  modal = new ModalPage(page, 'multichain-ethers-solana', 'default')
  validator = new ModalValidator(page)

  await modal.load()
  await modal.page.reload()
})

test.afterAll(async () => {
  await page?.close()
  await wallet?.page.close()
})

// -- Tests --------------------------------------------------------------------
test('should connect multiple wallets across all namespaces', async () => {
  // Connect WalletConnect (EVM + Solana)
  await modal.openConnectModal()
  await modal.clickWalletConnect()
  await modal.qrCodeFlow(modal, wallet, 'immediate')
  await validator.expectConnected()
  walletConnectEvmAddress = await modal.getAddress()
  await validator.expectNetworkButton('Ethereum')
  await validator.expectConnectedWalletType('WALLET_CONNECT')
  await modal.openProfileWalletsView()
  await modal.clickProfileWalletsViewTab('solana')
  walletConnectSolanaAddress = await validator.getActiveProfileWalletItemAddress()
  await modal.closeModal()

  // Connect Email Wallet (EVM)
  await modal.openProfileWalletsView()
  await modal.clickProfileWalletsViewTab('evm')
  await modal.clickAddWalletButton()
  validator.expectSecureSiteFrameNotInjected()
  await modal.emailFlow({
    emailAddress: tempEmail,
    context: modal.page.context(),
    mailsacApiKey: apiKey,
    clickConnectButton: false
  })
  await modal.closeModal()
  await validator.expectConnected()
  await validator.expectNetworkButton('Ethereum')
  await validator.expectConnectedWalletType('AUTH')

  // Connect Extension Wallet (Solana)
  await modal.openProfileWalletsView()
  await modal.clickProfileWalletsViewTab('solana')
  await modal.clickAddWalletButton()
  const solanaExtensionWallet = await modal.getExtensionWallet()
  await solanaExtensionWallet.click()
  await modal.closeModal()
  await validator.expectConnected()
  await validator.expectNetworkButton('Solana')
  await validator.expectConnectedWalletType('ANNOUNCED')
})

test('should switch between different wallets across all namespaces', async () => {
  // Validate that we have expected number of connections for each namespace
  await modal.openProfileWalletsView()
  await modal.clickProfileWalletsViewTab('evm')
  await validator.expectActiveConnectionsFromProfileWalletsCount(3)

  await modal.clickProfileWalletsViewTab('solana')
  await validator.expectActiveConnectionsFromProfileWalletsCount(2)

  await modal.closeModal()

  // Sign message with Email Wallet on Ethereum
  await modal.sign('eip155')
  await modal.approveSign()
  await validator.expectAcceptedSign()
  await validator.waitUntilSuccessToastHidden()

  // Switch to WalletConnect & sign message on Ethereum
  await modal.openProfileWalletsView()
  await modal.clickProfileWalletsViewTab('evm')
  await modal.switchAccountByAddress(walletConnectEvmAddress)
  await validator.expectActiveProfileWalletItemAddress(walletConnectEvmAddress)
  await modal.closeModal()
  await modal.sign('eip155')
  await wallet.handleRequest({ accept: true })
  await validator.expectAcceptedSign()
  await validator.waitUntilSuccessToastHidden()

  // Sign message with Extension Wallet on Solana
  await modal.sign('solana')
  await validator.expectAcceptedSign()
  await validator.waitUntilSuccessToastHidden()

  // Switch to WalletConnect & sign message on Solana
  await modal.openProfileWalletsView()
  await modal.clickProfileWalletsViewTab('solana')
  await modal.switchAccountByAddress(walletConnectSolanaAddress)
  await validator.expectActiveProfileWalletItemAddress(walletConnectSolanaAddress)
  await modal.closeModal()
  await modal.sign('solana')
  await wallet.handleRequest({ accept: true })
  await validator.expectAcceptedSign()
})

test('should switch network as expected', async () => {
  await modal.switchNetwork('Polygon')
  await validator.expectSwitchedNetwork('Polygon')
  await modal.closeModal()

  await modal.switchNetwork('Solana')
  await validator.expectSwitchedNetwork('Solana')
  await modal.closeModal()
})

test('should refresh page and expect reconnected', async () => {
  await modal.page.reload()
  await validator.expectNetworkButton('Solana')
  await validator.expectAccountButtonReady()

  await modal.switchNetworkWithNetworkButton('Ethereum')
  await validator.expectSwitchedNetwork('Ethereum')
  await modal.closeModal()
  await validator.expectAccountButtonReady()
})

test('it should disconnect as expected', async () => {
  await modal.disconnect()
  await validator.expectDisconnected()
})
