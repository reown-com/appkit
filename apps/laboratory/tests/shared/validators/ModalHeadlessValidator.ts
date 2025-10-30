import { expect } from '@playwright/test'

import { getMaximumWaitConnections } from '@reown/appkit-testing'

import { ModalValidator } from './ModalValidator'

const MAX_WAIT = getMaximumWaitConnections()

export class ModalHeadlessValidator extends ModalValidator {
  // -- Headless Drawer Validators ----------------------------------------------
  async expectHeadlessDrawerOpen() {
    const drawer = this.page.locator('[data-testid="headless-drawer"]')
    await expect(drawer, 'Headless drawer should be open').toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectHeadlessDrawerClosed() {
    const drawer = this.page.locator('[data-testid="headless-drawer"]')
    await expect(drawer, 'Headless drawer should be closed').toBeHidden({
      timeout: MAX_WAIT
    })
  }

  async expectHeadlessConnectUI() {
    const connectHeading = this.page.getByText('Connect Wallet')
    await expect(connectHeading, 'Connect Wallet heading should be visible').toBeVisible({
      timeout: MAX_WAIT
    })

    const seeAllButton = this.page.getByTestId('see-all-button')
    await expect(seeAllButton, 'See All Wallets button should be visible').toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectWalletConnectOption() {
    const walletConnectItem = this.page.getByTestId('wc-wallet-item-WalletConnect')
    await expect(walletConnectItem, 'WalletConnect option should be visible').toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectReownExtensionOption() {
    const reownExtension = this.page.getByTestId('wallet-button-Reown')

    await expect(reownExtension, 'Reown extension should be visible').toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectHeadlessSearchView() {
    const searchHeading = this.page.getByText(/Search Wallets \(\d+\)/u)
    await expect(searchHeading, 'Search Wallets heading should be visible').toBeVisible({
      timeout: MAX_WAIT
    })

    const searchInput = this.page.getByPlaceholder('Search by name...')
    await expect(searchInput, 'Search input should be visible').toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectWalletItemsCount({ min }: { min: number }) {
    const walletItems = this.page.getByTestId(/^wc-wallet-item-/u)

    // Wait up to 10s for the count to reach at least min using expect.poll
    await expect
      .poll(async () => await walletItems.count(), {
        timeout: 10_000,
        message: `Should have at least ${min} wallet items`
      })
      .toBeGreaterThanOrEqual(min)
  }

  async expectLoadMoreButtonNotLoading() {
    const loadMoreButton = this.page.getByRole('button', { name: 'Load More Wallets' })
    const loadingText = loadMoreButton.getByText('Loading...')
    await expect(loadingText, 'Load more button should not be loading').toBeHidden({
      timeout: MAX_WAIT
    })
  }

  async expectOnlyMetamaskVisible() {
    const metamaskItem = this.page.getByTestId('wc-wallet-item-MetaMask')
    await expect(metamaskItem, 'MetaMask should be visible').toBeVisible({
      timeout: MAX_WAIT
    })

    // Check that other common wallets are not visible
    const coinbaseItem = this.page.getByTestId('wc-wallet-item-CoinbaseWallet')
    const trustItem = this.page.getByTestId('wc-wallet-item-TrustWallet')

    if (await coinbaseItem.isVisible()) {
      await expect(
        coinbaseItem,
        'Coinbase should not be visible when searching MetaMask'
      ).toBeHidden()
    }

    if (await trustItem.isVisible()) {
      await expect(trustItem, 'Trust should not be visible when searching MetaMask').toBeHidden()
    }
  }

  async expectAddressVisible() {
    const addressElement = this.page.getByTestId('w3m-address')
    await expect(addressElement, 'Address should be visible').toBeVisible({
      timeout: MAX_WAIT
    })
  }
}
