import { expect, test } from '@playwright/test'
import type { Page, BrowserContext } from '@playwright/test'

// eslint-disable-next-line @typescript-eslint/require-await
test.describe('Explorer view', async () => {
  /* Open explorer view */
  test.beforeEach(async ({ page }) => {
    await page.goto('./with-wagmi/react')
    await page.getByTestId('partial-core-connect-button').click()
    await page.getByTestId('partial-all-wallets-button').click()
    await expect(page.getByTestId('view-wallet-explorer-content')).toBeVisible()
  })

  test.afterEach(async ({ page }) => {
    await expect(page).not.toHaveTitle('Error')
  })

  /* Helpers */

  /* Return to previous page */
  async function testBack(page: Page) {
    await page.getByTestId('component-header-back-button').click()
    await expect(page.getByTestId('view-install-wallet-content')).not.toBeVisible()
  }

  async function testBrowserButton(page: Page) {
    const browserButton = page.locator('w3m-button', { hasText: 'Browser' })
    if (await browserButton.isVisible()) {
      await expect(browserButton).toBeVisible()
      await browserButton.click()
    }
  }

  async function testWebButton(page: Page, context: BrowserContext) {
    const webButton = page.locator('w3m-button', { hasText: 'Web' })
    if (await webButton.isVisible()) {
      await expect(webButton).toBeVisible()

      /* Open wallet web page */
      const pagePromise = context.waitForEvent('page')
      await webButton.click()
      const newPage = await pagePromise
      await newPage.waitForLoadState()

      expect(page.url()).not.toBe(newPage.url())
      await expect(page).not.toHaveURL('error')
    }
  }

  async function testDownloadButton(page: Page, context: BrowserContext) {
    const downloadButton = page.getByTestId('view-install-wallet-download-button')
    if (await downloadButton.isVisible()) {
      await expect(downloadButton).toBeVisible()

      /* Open wallet download page */
      const pagePromise = context.waitForEvent('page')
      await downloadButton.click()
      const newPage = await pagePromise
      await newPage.waitForLoadState()

      expect(page.url()).not.toBe(newPage.url())
      await expect(page).not.toHaveURL('error')
    }
  }

  /**
   * Used to open a wallet from the explorer view
   * @param walletName - name of wallet to open
   * @param page - playwright page
   */
  async function openWalletFromExplorer(walletName: string, page: Page) {
    await page.getByTestId('component-search-input').type(walletName)
    await expect(page.getByTestId('component-search-input')).toHaveValue(walletName)

    const walletButton = page.getByTestId(`component-wallet-button-${walletName.toLowerCase()}`)
    await expect(walletButton).toBeVisible()
    await expect(page.locator('w3m-wallet-button')).toHaveCount(1)
    await walletButton.click()
  }

  /**
   * Used to check that the UI elements of the mobile view are correct
   * @param walletName - name of wallet to open
   * @param page - playwright page
   */
  async function testWalletMobileView(walletName: string, page: Page) {
    /* Ensure components loaded correctly in header */
    const header = page.getByTestId('view-mobile-qr-connecting-header')
    await expect(header).toBeVisible()

    const headerTitle = header.locator('w3m-text')
    expect(headerTitle).toBeVisible()

    const headerText = (await headerTitle.innerText()).toLowerCase()
    expect(headerText).toBe(walletName.toLowerCase())

    /* Ensure componented loaded correctly in content */
    const qrCode = page.getByTestId('partial-qr-code')
    await expect(qrCode).toBeVisible()
    await expect(qrCode.locator('w3m-wallet-image')).toBeVisible()

    /* Ensure components loaded correctly in footer */
    await expect(page.getByTestId('view-mobile-qr-connecting-footer')).toBeVisible()

    /* Return to previous page */
    await testBack(page)
  }

  /**
   * Used to check that the UI elements of the install view are correct
   * @param walletName - name of wallet to open
   * @param page - playwright page
   * @param context - playwright context
   */
  async function testWalletInstallView(walletName: string, page: Page, context: BrowserContext) {
    await testBrowserButton(page)

    await expect(page.getByTestId('view-install-wallet-content')).toBeVisible()
    await testDownloadButton(page, context)

    /* Return to previous page */
    await testBack(page)
  }

  /**
   * Used to check that the UI elements of the desktop view are correct
   * @param walletName - name of wallet to open
   * @param page - playwright page
   */
  async function testWalletDesktopView(walletName: string, page: Page, context: BrowserContext) {
    const mobileButton = page.locator('w3m-button', { hasText: 'Mobile' })
    await expect(mobileButton).toBeVisible()
    await mobileButton.click()

    /* Test web button */
    const webPage = await context.newPage()
    await testWebButton(webPage, context)

    /* Ensure mobile view loads correctly */
    await page.getByTestId('view-mobile-qr-connecting-content').isVisible()
    await testWalletMobileView(walletName, page)
  }

  test('MetaMask explorer view', async ({ page, context }) => {
    const walletName = 'MetaMask'
    await openWalletFromExplorer(walletName, page)

    /* Ensure Mobile view loads correctly */
    await testWalletMobileView(walletName, page)

    /* Attempt to open extension (should fail since not installed) */
    await testWalletInstallView(walletName, page, context)
  })

  test('Zerion explorer view', async ({ page, context }) => {
    const walletName = 'Zerion'
    await openWalletFromExplorer(walletName, page)

    /* Ensure desktop view loads correctly */
    await testWalletDesktopView(walletName, page, context)
  })
})
