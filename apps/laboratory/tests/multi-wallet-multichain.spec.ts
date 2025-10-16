/* eslint-disable no-await-in-loop */
import { type Page, expect } from '@playwright/test'

import { WalletPage } from '@reown/appkit-testing'

import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modal: ModalPage
let validator: ModalValidator
let wallet: WalletPage
let page: Page
let apiKey: string
let walletConnectEvmAddress: string
let walletConnectSolanaAddress: string
let evmExtensionWalletAddress: string
let solanaExtensionWalletAddress: string

// -- Setup --------------------------------------------------------------------
const test = extensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ page: _page, context }) => {
  apiKey = process.env['MAILSAC_API_KEY'] as string

  if (!apiKey) {
    throw new Error('MAILSAC_API_KEY required')
  }

  page = _page
  wallet = new WalletPage(await context.newPage())
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
test('should enable multi-wallet feature with a whitelisted project id', async () => {
  await page.getByTestId('project-id-button').click()
  await page.getByTestId('project-id-input').fill('1b0841d0acfe3e32dcb0d53dbf505bdd')
  await page.getByTestId('project-id-save-button').click()
  await page.reload()
})

test('should connect multiple wallets across all namespaces', async () => {
  // Connect WalletConnect (EVM + Solana)
  await modal.openConnectModal()
  await modal.clickWalletConnect()
  await modal.qrCodeFlow(modal, wallet, 'immediate')
  await validator.expectConnected()
  await validator.expectConnectedWalletType('WALLET_CONNECT')

  await modal.openProfileWalletsView()
  walletConnectEvmAddress = await modal.getActiveProfileWalletItemAddress()

  await modal.clickTab('solana')
  walletConnectSolanaAddress = await modal.getActiveProfileWalletItemAddress()

  // Connect Extension Wallet (Solana)
  await modal.clickAddWalletButton()
  const solanaExtensionWallet = await modal.getExtensionWallet()
  await solanaExtensionWallet.click()

  await validator.expectAccountSwitched(walletConnectSolanaAddress)
  solanaExtensionWalletAddress = await modal.getActiveProfileWalletItemAddress()

  await modal.closeModal()

  await validator.expectNetworkButton('Solana')
  await validator.expectConnectedWalletType('ANNOUNCED')
  await validator.expectNetworkButton('Solana')

  // Connect Extension Wallet (EVM)
  await modal.openProfileWalletsView()
  await modal.clickTab('evm')
  await modal.clickAddWalletButton()

  const evmExtensionWallet = await modal.getExtensionWallet()
  await evmExtensionWallet.click()

  await validator.expectAccountSwitched(walletConnectEvmAddress)
  evmExtensionWalletAddress = await modal.getActiveProfileWalletItemAddress()

  await modal.closeModal()

  await validator.expectNetworkButton('Ethereum')
  await validator.expectConnectedWalletType('ANNOUNCED')
  await validator.expectNetworkButton('Ethereum')
})

test('should switch between different wallets across all namespaces', async () => {
  // Validate that we have expected number of connections for each namespace
  await modal.openProfileWalletsView()
  await modal.clickTab('evm')
  await validator.expectActiveProfileWalletItemAddress(evmExtensionWalletAddress)
  await validator.expectActiveConnectionsFromProfileWalletsCount(2)

  await modal.clickTab('solana')
  await validator.expectActiveProfileWalletItemAddress(solanaExtensionWalletAddress)
  await validator.expectActiveConnectionsFromProfileWalletsCount(2)

  await modal.closeModal()

  // Sign message with Extension Wallet on Ethereum
  await modal.sign('eip155')
  await validator.expectAcceptedSign()
  await validator.waitUntilSuccessToastHidden()

  // Sign message with Extension Wallet on Solana
  await modal.sign('solana')
  await validator.expectAcceptedSign()
  await validator.waitUntilSuccessToastHidden()

  // Sign message with WalletConnect on Ethereum
  await modal.openProfileWalletsView()
  await modal.clickTab('evm')
  await modal.switchAccountByAddress(walletConnectEvmAddress)
  await validator.expectAccountSwitched(evmExtensionWalletAddress)
  await modal.closeModal()
  await modal.sign('eip155')
  await wallet.handleRequest({ accept: true })
  await validator.expectAcceptedSign()
  await validator.waitUntilSuccessToastHidden()

  // Sign message with WalletConnect on Solana
  await modal.openProfileWalletsView()
  await modal.clickTab('solana')
  await modal.switchAccountByAddress(walletConnectSolanaAddress)
  await validator.expectAccountSwitched(solanaExtensionWalletAddress)
  await modal.closeModal()
  await modal.sign('solana')
  await wallet.handleRequest({ accept: true })
  await validator.expectAcceptedSign()
  await validator.waitUntilSuccessToastHidden()
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
  // After page reload, Solana should appear first as it was the last connected network
  await modal.page.reload()
  await validator.expectNetworkButton('Solana')
  await validator.expectAccountButtonReady()

  await modal.switchNetworkWithNetworkButton('Ethereum')
  await validator.expectSwitchedNetwork('Ethereum')
  await modal.closeModal()
  await validator.expectAccountButtonReady()
})

test('it should disconnect each wallet as expected', async () => {
  // Disconnect from all wallets, it should redirect to ProfileWallets view and show EVM extension wallet as still connected
  await modal.disconnect()
  await validator.expectActiveProfileWalletItemAddress(evmExtensionWalletAddress)

  // Switch to Solana tab and check if Solana extension wallet is connected
  await modal.clickTab('solana')
  await validator.expectActiveProfileWalletItemAddress(solanaExtensionWalletAddress)

  // Disconnect from EVM extension wallet
  await modal.closeModal()
  await modal.disconnect()
  await validator.expectDisconnected()

  // Switch to Solana
  await modal.switchNetworkWithNetworkButton('Solana')
  await validator.expectSwitchedNetwork('Solana')
  await modal.closeModal()
  await validator.expectConnected()

  // Disconnect from Solana extension wallet
  await modal.disconnect()
  await validator.expectDisconnected()
})

test('should disconnect only the selected wallet', async () => {
  await modal.openConnectModal('solana')
  const solanaExtensionWallet = await modal.getExtensionWallet()
  await solanaExtensionWallet.click()
  await validator.expectConnected('solana')
  solanaExtensionWalletAddress = await modal.getAddress('solana')

  await modal.openConnectModal('eip155')
  await modal.qrCodeFlow(modal, wallet, undefined, true)
  await validator.expectConnected('eip155')
  await validator.expectConnected('solana')

  walletConnectSolanaAddress = await modal.getAddress('solana')
  walletConnectEvmAddress = await modal.getAddress('eip155')

  expect(await modal.getAddress('solana')).not.toBe(solanaExtensionWalletAddress)

  await modal.openAccount()
  await modal.clickWalletSwitchButton()
  await modal.clickTab('solana')

  await modal.disconnectConnection('Reown')
  await modal.closeModal()

  await modal.page.reload()

  await validator.expectConnected('eip155')
  await validator.expectConnected('solana')

  expect(await modal.getAddress('solana')).toBe(walletConnectSolanaAddress)
  expect(await modal.getAddress('eip155')).toBe(walletConnectEvmAddress)
})

test('should disconnect WC as expected for all namespaces', async () => {
  await modal.openAccount()
  await modal.clickWalletSwitchButton()
  await modal.clickTab('solana')

  await modal.clickProfileWalletsDisconnectButton()

  await validator.expectDisconnected('solana')
  await validator.expectDisconnected('eip155')
})
