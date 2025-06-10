import type { Page } from '@playwright/test'

import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { WalletPage } from './shared/pages/WalletPage'
import { Email } from './shared/utils/email'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modal: ModalPage
let validator: ModalValidator
let wallet: WalletPage
let email: Email
let page: Page
let apiKey: string
let tempEmail: string

let extensionAddress: string
let walletConnectAddress: string
let emailAddress: string

// -- Types --------------------------------------------------------------------
type ValidateConnectionsStateParams = {
  activeAddress: string
  totalConnections: number
  activeConnectionsAddresses?: string[]
}

// -- Helpers ---------------------------------------------------------
async function getAddress() {
  return modal.page.getByTestId('w3m-address').textContent() as Promise<string>
}

async function connectExtensionWallet() {
  await modal.openProfileWalletsView()
  await modal.clickAddWalletButton()
  const walletSelector = await modal.getExtensionWallet()
  await walletSelector.click()
  await validator.expectConnected()

  return getAddress()
}

async function connectWalletConnect() {
  await modal.qrCodeFlow(modal, wallet)

  return getAddress()
}

async function connectEmail() {
  await modal.openProfileWalletsView()
  await modal.clickAddWalletButton()
  await modal.emailFlow({
    emailAddress: tempEmail,
    context: page.context(),
    mailsacApiKey: apiKey,
    clickConnectButton: false
  })

  return getAddress()
}

async function validateConnectionsState({
  activeAddress,
  totalConnections,
  activeConnectionsAddresses
}: ValidateConnectionsStateParams) {
  await validator.expectActiveProfileWalletItemAddress(activeAddress)
  await validator.expectActiveConnectionsFromProfileWalletsCount(totalConnections)

  if (activeConnectionsAddresses) {
    await validator.expectActiveConnectionsFromProfileWallets(
      activeConnectionsAddresses.map(address => ({ address }))
    )
  }
}

// -- Setup --------------------------------------------------------------------
const test = extensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ library, context }) => {
  apiKey = process.env['MAILSAC_API_KEY'] as string

  if (!apiKey) {
    throw new Error('MAILSAC_API_KEY required')
  }

  page = await context.newPage()
  wallet = new WalletPage(await context.newPage())
  email = new Email(apiKey)
  tempEmail = await email.getEmailAddressToUse()
  modal = new ModalPage(page, library, 'default')
  validator = new ModalValidator(page)

  await modal.load()
  await modal.page.reload()
})

// -- Tests --------------------------------------------------------------------
test('connect multiple wallets', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  // Step 1: Connect WalletConnect Wallet
  walletConnectAddress = await connectWalletConnect()
  await validator.expectAccountButtonAddress(extensionAddress)
  await modal.openProfileWalletsView()
  await validateConnectionsState({
    activeAddress: extensionAddress,
    totalConnections: 1
  })

  // Close modal and verify that the wallet is switched
  await modal.closeModal()
  await validator.expectAccountButtonAddress(walletConnectAddress)

  // Step 2: Connect Extension Wallet
  extensionAddress = await connectExtensionWallet()
  await validateConnectionsState({
    activeAddress: extensionAddress,
    totalConnections: 2,
    activeConnectionsAddresses: [walletConnectAddress]
  })

  // Close modal and verify that the wallet is switched
  await modal.closeModal()
  await validator.expectAccountButtonAddress(extensionAddress)
  await validator.expectAccountSwitched(walletConnectAddress)

  // Step 3: Connect Email Wallet
  validator.expectSecureSiteFrameNotInjected()
  emailAddress = await connectEmail()
  await validateConnectionsState({
    activeAddress: emailAddress,
    // Solana doesn't include smart account, only EOA
    totalConnections: library === 'solana' ? 3 : 4,
    activeConnectionsAddresses: [walletConnectAddress, extensionAddress]
  })

  // Close modal and verify that the wallet is switched and the current account is the email wallet address
  await modal.closeModal()
  await validator.expectAccountButtonAddress(emailAddress)
  await validator.expectAccountSwitched(extensionAddress)
  await validator.expectAccountSwitched(walletConnectAddress)
})

test('wallet actions', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  // Perform signing operation for current account
  await modal.sign()
  await modal.approveSign()
  await validator.expectAcceptedSign()
  await modal.openProfileWalletsView()

  if (library === 'wagmi') {
    await modal.clickProfileWalletsDisconnectButton()
    await validator.expectAccountSwitched(emailAddress)
  }

  const activeConnectionsAddresses = await modal.getActiveConnectionsAddresses()

  if (activeConnectionsAddresses.length === 0) {
    throw new Error('No active connections found')
  }

  await modal.closeModal()

  /* eslint-disable no-await-in-loop */
  for (const connectionAddress of activeConnectionsAddresses) {
    await modal.openProfileWalletsView()
    await modal.switchAccountByAddress(connectionAddress)
    await modal.closeModal()
    await validator.expectAccountButtonAddress(connectionAddress)
    await modal.sign()

    const isEmail = await validator.expectConnectedWalletType('AUTH')
    const isWalletConnect = await validator.expectConnectedWalletType('WALLET_CONNECT')

    if (isEmail) {
      await modal.approveSign()
    } else if (isWalletConnect) {
      await wallet.handleRequest({ accept: true })
    }

    await validator.expectAcceptedSign()
  }
})
