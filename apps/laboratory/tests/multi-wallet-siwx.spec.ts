/* eslint-disable no-await-in-loop */
import type { Page } from '@playwright/test'

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
let walletConnectAddress: string
let extensionAddress: string

// -- Constants ----------------------------------------------------------------
const networks = ['Polygon', 'Base', 'Ethereum', 'Solana']

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
test('should enable multi-wallet feature with a whitelisted project id', async ({ library }) => {
  if (library === 'bitcoin' || library === 'ton') {
    return
  }

  await page.getByTestId('project-id-button').click()
  await page.getByTestId('project-id-input').fill('1b0841d0acfe3e32dcb0d53dbf505bdd')
  await page.getByTestId('project-id-save-button').click()
  await page.reload()
})

test('should connect multiple wallets with SIWX', async ({ library }) => {
  if (library === 'bitcoin' || library === 'ton') {
    return
  }

  // Connect WalletConnect Wallet
  await modal.qrCodeFlow(modal, wallet)
  await modal.promptSiwe()
  await wallet.handleRequest({ accept: true })
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
})

test('should require SIWX signature when switching networks with multiple wallets', async ({
  library
}) => {
  if (library === 'bitcoin' || library === 'ton') {
    return
  }

  const previouslyConnectedAddresses = [walletConnectAddress, extensionAddress].filter(Boolean)

  if (previouslyConnectedAddresses.length === 0) {
    throw new Error(`Expected 2 addresses but got ${previouslyConnectedAddresses.length}`)
  }

  for (const [idx, address] of previouslyConnectedAddresses.entries()) {
    const _currentAddress = await modal.getAddress()
    await modal.openProfileWalletsView()
    await modal.switchAccountByAddress(address)

    await modal.closeModal()
    await validator.expectAccountSwitched(_currentAddress)

    const network = networks[idx]

    if (!network) {
      throw new Error('Network not found')
    }

    await modal.switchNetwork(network)
    await modal.promptSiwe()

    const isWalletConnect = (await modal.getConnectedWalletType()) === 'WALLET_CONNECT'

    if (isWalletConnect) {
      await wallet.handleRequest({ accept: true })
    }

    await validator.expectConnected()
  }
})

test('should maintain SIWX state after page refresh', async ({ library }) => {
  if (library === 'bitcoin' || library === 'ton') {
    return
  }

  await modal.page.reload()
  await validator.expectConnected()
})
