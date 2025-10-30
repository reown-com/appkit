import { expect } from '@playwright/test'

import { DEFAULT_SESSION_PARAMS, WalletPage, WalletValidator } from '@reown/appkit-testing'

import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalHeadlessPage } from './shared/pages/ModalHeadlessPage'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalHeadlessPage
let modalValidator: ModalValidator
let walletPage: WalletPage
let walletValidator: WalletValidator

// -- Setup --------------------------------------------------------------------
const headlessTest = extensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

headlessTest.describe.configure({ mode: 'serial' })

headlessTest.beforeAll(async ({ library, context }) => {
  const browserPage = await context.newPage()

  modalPage = new ModalHeadlessPage(browserPage, library, 'default')
  modalValidator = new ModalValidator(browserPage)
  walletPage = new WalletPage(await context.newPage())
  walletValidator = new WalletValidator(walletPage.page)

  await modalPage.load()
})

headlessTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
headlessTest('should render connect UI and see WalletConnect and Reown extension', async () => {
  // Open the headless drawer
  await modalPage.openHeadlessDrawer()

  // Check that the drawer is open and shows the connect UI
  await modalValidator.expectHeadlessDrawerOpen()
  await modalValidator.expectHeadlessConnectUI()

  // Check for WalletConnect option
  await modalValidator.expectWalletConnectOption()

  // Check for Reown extension (if available)
  await modalValidator.expectReownExtensionOption()

  await modalPage.closeHeadlessDrawer()
})

headlessTest('should connect with WalletConnect as expected', async () => {
  // Open the headless drawer
  await modalPage.openHeadlessDrawer()

  // Click on WalletConnect option
  await modalPage.clickWalletConnectInHeadless()

  // Expect QR code to be rendered
  await modalPage.qrCodeFlow(modalPage, walletPage)

  // Expect drawer to close and address to be visible
  await modalValidator.expectHeadlessDrawerClosed()
  await modalValidator.expectAddressVisible()

  await modalPage.disconnectFromHeadless()
})

headlessTest('should connect with Reown extension and Solana namespace successfully', async () => {
  // Open the headless drawer
  await modalPage.openHeadlessDrawer()

  // Click on Reown extension
  await modalPage.clickReownExtensionInHeadless()

  // Select Solana namespace if available
  await modalPage.selectSolanaNamespaceInHeadless()

  // Expect drawer to close and address to be visible
  await modalValidator.expectHeadlessDrawerClosed()
  await modalValidator.expectAddressVisible()

  await modalPage.disconnectFromHeadless()
})

headlessTest('should render all wallets page as expected', async () => {
  // Open the headless drawer
  await modalPage.openHeadlessDrawer()

  // Click "See All Wallets"
  await modalPage.clickSeeAllWalletsInHeadless()

  // Expect to be in search view
  await modalValidator.expectHeadlessSearchView()

  // Expect at least a few wallet items
  await modalValidator.expectWalletItemsCount({ min: 3 })

  await modalPage.closeHeadlessDrawer()
})

headlessTest('should load more wallets as expected', async () => {
  // Open the headless drawer and go to search view
  await modalPage.openHeadlessDrawer()
  await modalPage.clickSeeAllWalletsInHeadless()

  // Expect initial fetch completed
  await modalValidator.expectWalletItemsCount({ min: 3 })

  // Get wallets count
  const initialCount = await modalPage.getWalletItemsCount()

  // Click "Load More Wallets"
  await modalPage.clickLoadMoreWalletsInHeadless()

  // Wait for loading to complete
  await modalValidator.expectLoadMoreButtonNotLoading()

  await modalValidator.expectWalletItemsCount({ min: initialCount + 1 })

  await modalPage.closeHeadlessDrawer()
})

headlessTest('should search for Metamask wallet as expected', async () => {
  // Open the headless drawer and go to search view
  await modalPage.openHeadlessDrawer()
  await modalPage.clickSeeAllWalletsInHeadless()

  // Search for "Metamask"
  await modalPage.searchWalletsInHeadless('Metamask')

  // Expect only Metamask wallet to be visible
  await modalValidator.expectOnlyMetamaskVisible()

  await modalPage.searchWalletsInHeadless('')

  await modalValidator.expectWalletItemsCount({ min: 3 })
})
