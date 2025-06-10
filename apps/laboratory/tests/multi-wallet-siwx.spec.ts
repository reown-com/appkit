/* eslint-disable no-await-in-loop */
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
let emailWalletAddress: string
let walletConnectAddress: string
let extensionAddress: string

// -- Constants ----------------------------------------------------------------
const networks = ['Polygon', 'Base', 'Ethereum', 'Solana']

// -- Helpers ------------------------------------------------------------------
async function approveSign() {
  const isEmail = (await validator.getConnectedWalletType()) === 'AUTH'
  const isWalletConnect = (await validator.getConnectedWalletType()) === 'WALLET_CONNECT'

  if (isEmail) {
    await modal.page.waitForTimeout(5000)
    await modal.approveSign()
  } else if (isWalletConnect) {
    await wallet.handleRequest({ accept: true })
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
  modal = new ModalPage(page, library, 'siwx')
  validator = new ModalValidator(page)

  await modal.load()
  await modal.page.reload()
})

test.afterAll(async () => {
  await page.close()
  await wallet.page.close()
})

// -- Tests --------------------------------------------------------------------
test('should connect multiple wallets with SIWX', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  // Connect WalletConnect Wallet & Sign
  await modal.qrCodeFlow(modal, wallet)
  await validator.expectConnected()
  walletConnectAddress = await modal.getAddress()

  // Connect Extension Wallet & Sign
  await modal.openProfileWalletsView()
  await modal.clickAddWalletButton()
  const extensionWallet = await modal.getExtensionWallet()
  await extensionWallet.click()
  await modal.promptSiwe()
  await validator.expectConnected()
  await validator.expectAccountSwitched(walletConnectAddress)
  extensionAddress = await modal.getAddress()

  // Connect Email Wallet & Sign
  await modal.openProfileWalletsView()
  await modal.clickAddWalletButton()
  validator.expectSecureSiteFrameNotInjected()
  await modal.emailFlow({
    emailAddress: tempEmail,
    context: page.context(),
    mailsacApiKey: apiKey,
    clickConnectButton: false
  })
  await modal.promptSiwe()
  await modal.approveSign()
  await validator.expectConnected()
  await validator.expectAccountSwitched(extensionAddress)
  emailWalletAddress = await modal.getAddress()
})

test('should require SIWX signature when switching networks with multiple wallets', async ({
  library
}) => {
  if (library === 'bitcoin') {
    return
  }

  const previouslyConnectedAddresses = [
    walletConnectAddress,
    extensionAddress,
    emailWalletAddress
  ].map(address => address.toLowerCase())

  const currentAddress = await modal.getAddress()
  await modal.openProfileWalletsView()

  const filteredConnectedAddresses = await modal
    .getActiveConnectionsAddresses()
    .then(addresses =>
      addresses.filter(address => previouslyConnectedAddresses.includes(address.toLowerCase()))
    )
    .then(addresses =>
      addresses.filter(address => address.toLowerCase() !== currentAddress.toLowerCase())
    )

  if (filteredConnectedAddresses.length === 0) {
    throw new Error('No active connections found')
  }

  await modal.closeModal()

  for (const [idx, address] of filteredConnectedAddresses.entries()) {
    const _currentAddress = await modal.getAddress()
    await modal.openProfileWalletsView()
    await modal.switchAccountByAddress(address)

    const isWalletConnect = (await validator.getConnectedWalletType()) === 'WALLET_CONNECT'

    /*
     * If the user signs in with 1-click auth and then switches to a another
     * WalletConnect wallet, they willl be prompted to sign in again
     */
    if (isWalletConnect) {
      await modal.promptSiwe()
      await approveSign()
    } else {
      await modal.closeModal()
    }

    await validator.expectAccountSwitched(_currentAddress)

    const network = networks[idx]

    if (!network) {
      throw new Error('Network not found')
    }

    await modal.switchNetwork(network)
    await modal.promptSiwe()
    await approveSign()
    await validator.expectConnected()
  }
})

test('should maintain SIWX state after page refresh', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  await modal.page.reload()
  await validator.expectConnected()
})
