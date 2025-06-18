/* eslint-disable no-await-in-loop */
import type { Page } from '@playwright/test'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { WalletPage } from '@reown/appkit-testing'

import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

// -- Constants --------------------------------------------------------------------
const CONNECTOR_IDS_TO_DISCONNECT = [
  CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT,
  CommonConstantsUtil.CONNECTOR_ID.INJECTED
]

/* eslint-disable init-declarations */
let modal: ModalPage
let validator: ModalValidator
let wallet: WalletPage
let page: Page
let apiKey: string
let extensionAddress: string

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
  modal = new ModalPage(page, library, 'default')
  validator = new ModalValidator(page)

  await modal.load()
  await modal.page.reload()
})

// -- Tests --------------------------------------------------------------------
test('should enable multi-wallet feature with a whitelisted project id', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  await page.getByTestId('project-id-button').click()
  await page.getByTestId('project-id-input').fill('1b0841d0acfe3e32dcb0d53dbf505bdd')
  await page.getByTestId('project-id-save-button').click()
  await page.reload()
})

test('should connect multiple wallets', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  // Connect WalletConnect wallet
  await modal.qrCodeFlow(modal, wallet)
  await validator.expectConnected()

  // Connect Extension wallet
  await modal.openProfileWalletsView()
  await modal.clickAddWalletButton()
  const extensionWallet = await modal.getExtensionWallet()
  await extensionWallet.click()
  await modal.closeModal()
  await validator.expectConnected()
  extensionAddress = await modal.getAddress()

  // Validate ProfileWallets view
  await modal.openProfileWalletsView()
  await validator.expectActiveProfileWalletItemAddress(extensionAddress)
  await validator.expectActiveConnectionsFromProfileWalletsCount(2)
  await modal.closeModal()
})

test('should sign with each wallet', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  await modal.openProfileWalletsView()
  const currentAddress = await modal.getAddress()
  const activeConnectionsAddresses = await modal.getActiveConnectionsAddresses()
  await modal.closeModal()

  const allAddresses = [...activeConnectionsAddresses, currentAddress]

  if (allAddresses.length !== 3) {
    throw new Error(`Expected 3 addresses but got ${allAddresses.length}`)
  }

  for (const address of allAddresses) {
    await modal.openProfileWalletsView()
    await modal.switchAccountByAddress(address)
    await modal.closeModal()
    await validator.expectAccountButtonAddress(address)
    await modal.sign()

    const isWalletConnect = (await modal.getConnectedWalletType()) === 'WALLET_CONNECT'

    if (isWalletConnect) {
      await wallet.handleRequest({ accept: true })
    }

    await validator.expectAcceptedSign()
  }
})

test('should keep wallets connected after page reload', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  await page.reload()
  await validator.expectConnected()
  await modal.openProfileWalletsView()
  await validator.expectActiveProfileWalletItemToExist()
  await validator.expectActiveConnectionsFromProfileWalletsCount(2)
  await modal.closeModal()
})

test('should disconnect all wallets', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  await modal.openProfileWalletsView()

  for (const [idx] of CONNECTOR_IDS_TO_DISCONNECT.entries()) {
    const address = await modal.getAddress()

    if (!address) {
      throw new Error('No address found')
    }

    const isLastConnectorId = idx === CONNECTOR_IDS_TO_DISCONNECT.length - 1

    await validator.expectActiveProfileWalletItemAddress(address)
    await modal.clickProfileWalletsDisconnectButton()

    if (isLastConnectorId) {
      await validator.expectDisconnected()
    } else {
      await validator.expectAccountSwitched(address)
    }
  }
})
