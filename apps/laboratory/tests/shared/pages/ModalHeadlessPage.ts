import { type Page, expect } from '@playwright/test'

import {
  BASE_URL,
  DEFAULT_SESSION_PARAMS,
  type WalletPage,
  WalletValidator
} from '@reown/appkit-testing'

import type { ModalFlavor } from './ModalPage'
import { ModalPage } from './ModalPage'

export class ModalHeadlessPage extends ModalPage {
  public override readonly page: Page
  public override readonly library: string
  public override readonly flavor: 'default'
  private readonly headlessUrl: string

  constructor(page: Page, library: string, flavor: ModalFlavor) {
    super(page, library, flavor)
    this.page = page
    this.library = library
    this.flavor = 'default'
    this.headlessUrl = `${BASE_URL}appkit?name=headless`
  }

  override async load() {
    await this.page.goto(this.headlessUrl)
    // In headless mode, w3m-modal is not rendered - wait for the connect button instead
    await this.page.waitForSelector('[data-testid="headless-connect-button"]', {
      state: 'visible',
      timeout: 30_000
    })
  }

  override async qrCodeFlow(_: ModalPage, walletPage: WalletPage): Promise<void> {
    // eslint-disable-next-line init-declarations
    if (!walletPage.isPageLoaded) {
      await walletPage.load()
    }
    const uri = await this.getWalletConnectURI()

    if (!uri) {
      throw new Error('WalletConnect URI not found')
    }

    await walletPage.connectWithUri(uri)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    const walletValidator = new WalletValidator(walletPage.page)
    await walletValidator.expectConnected()
  }

  async openHeadlessDrawer() {
    await this.page.getByTestId('headless-connect-button').click()
  }

  async closeHeadlessDrawer() {
    await this.page.getByTestId('headless-drawer-close-button').click()
  }

  async disconnectFromHeadless() {
    await this.page.getByTestId('headless-disconnect-button').click()
  }

  async clickWalletConnectInHeadless() {
    const walletConnectItem = this.page.getByTestId('wallet-button-WalletConnect')
    await expect(walletConnectItem, 'WalletConnect item should be visible').toBeVisible()
    await walletConnectItem.click()
  }

  async clickReownExtensionInHeadless() {
    // Look for Reown extension in injected wallets
    const reownExtension = this.page.getByTestId('wallet-button-Reown')
    await expect(reownExtension, 'Reown extension should be visible').toBeVisible()
    await reownExtension.click()
  }

  async selectSolanaNamespaceInHeadless() {
    const solanaConnector = this.page.getByText('Solana')
    if (await solanaConnector.isVisible()) {
      await solanaConnector.click()
    }
  }

  async clickSeeAllWalletsInHeadless() {
    const seeAllButton = this.page.getByTestId('see-all-button')
    await expect(seeAllButton, 'See All Wallets button should be visible').toBeVisible()
    await seeAllButton.click()
  }

  async clickLoadMoreWalletsInHeadless() {
    const loadMoreButton = this.page.getByRole('button', { name: 'Load More Wallets' })
    await expect(loadMoreButton, 'Load More Wallets button should be visible').toBeVisible()
    await loadMoreButton.click()
  }

  async searchWalletsInHeadless(query: string) {
    const searchInput = this.page.getByPlaceholder('Search by name...')
    await expect(searchInput, 'Search input should be visible').toBeVisible()
    await searchInput.fill(query)
    // Wait for debounced search to complete
    await this.page.waitForTimeout(600)
  }

  async getWalletItemsCount(): Promise<number> {
    const walletItems = this.page.getByTestId(/^wallet-button-/u)

    return await walletItems.count()
  }

  async getWalletConnectURI(): Promise<string | null> {
    const qrCode = this.page.locator('svg[data-testid="qr-code"]')
    if (await qrCode.isVisible()) {
      return await qrCode.getAttribute('data-value')
    }

    return null
  }
}
