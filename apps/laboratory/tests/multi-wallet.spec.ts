/* eslint-disable no-await-in-loop */
import type { Page } from '@playwright/test'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

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
  await validator.expectConnected()
  await modal.closeModal()

  // Connect Email wallet
  await modal.openProfileWalletsView()
  await modal.clickAddWalletButton()
  validator.expectSecureSiteFrameNotInjected()
  await modal.emailFlow({
    emailAddress: tempEmail,
    context: page.context(),
    mailsacApiKey: apiKey,
    clickConnectButton: false
  })
  await validator.expectConnected()
  await modal.closeModal()

  // Double check that all wallets are connected in ProfileWallets view
  await modal.openProfileWalletsView()
  // Solana doesn't include smart account in the count
  const expectedTotalWallets = library === 'solana' ? 3 : 4
  await validator.expectActiveConnectionsFromProfileWalletsCount(expectedTotalWallets)
  await modal.closeModal()
})

test('should sign with each wallet', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  // Start testing the signing with the current wallet (email wallet)
  await modal.sign()
  await modal.approveSign()
  await validator.expectAcceptedSign()
  await modal.openProfileWalletsView()

  const currentAddress = await modal.getAddress()

  /*
   * Wagmi has a bug where switching the preferred account type to a smart account
   * resets the entire connections object due to the reconnect() function being called.
   * As a temporary workaround, disconnect it and test the remaining wallets
   * such as WalletConnect and Extension.
   */
  if (library === 'wagmi') {
    const walletType = await modal.getConnectedWalletType()

    if (walletType === 'AUTH') {
      await modal.clickProfileWalletsDisconnectButton()
      await validator.expectAccountSwitched(currentAddress)
    }
  }

  const activeConnectionsAddresses = await modal.getActiveConnectionsAddresses()

  if (activeConnectionsAddresses.length === 0) {
    throw new Error('No active connections found')
  }

  await modal.closeModal()

  for (const address of activeConnectionsAddresses) {
    await modal.openProfileWalletsView()
    await modal.switchAccountByAddress(address)
    await modal.closeModal()

    await validator.expectAccountButtonAddress(address)

    await modal.sign()

    const isEmail = (await modal.getConnectedWalletType()) === 'AUTH'
    const isWalletConnect = (await modal.getConnectedWalletType()) === 'WALLET_CONNECT'

    if (isEmail) {
      await modal.approveSign()
    } else if (isWalletConnect) {
      await wallet.handleRequest({ accept: true })
    }

    await validator.expectAcceptedSign()
  }
})

test('should disconnect all wallets', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  await modal.openProfileWalletsView()

  const connectorIdsToDisconnect = [
    CommonConstantsUtil.CONNECTOR_ID.AUTH,
    CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT,
    CommonConstantsUtil.CONNECTOR_ID.INJECTED
  ].filter(connectorIdToDisconnect =>
    library === 'wagmi' ? connectorIdToDisconnect !== CommonConstantsUtil.CONNECTOR_ID.AUTH : true
  )

  for (const [idx] of connectorIdsToDisconnect.entries()) {
    const address = await modal.getAddress()

    if (!address) {
      throw new Error('No address found')
    }

    const isLastConnectorId = idx === connectorIdsToDisconnect.length - 1

    await validator.expectActiveProfileWalletItemAddress(address)
    await modal.clickProfileWalletsDisconnectButton()

    if (isLastConnectorId) {
      await validator.expectDisconnected()
    } else {
      await validator.expectAccountSwitched(address)
    }
  }
})
