import { expect, test } from '@playwright/test'

/*
 * Test pref injected providers
 * Url param: ?w3mPreferInjected=true
 */

/*
 * Validate network images load correctly
 *
 */

/* Open web3 modal page */
test.beforeEach(async ({ page }) => {
  page.goto('./with-wagmi/react')
  await expect(page.getByText('Connect your wallet')).not.toBeVisible()
  page.getByTestId('partial-core-connect-button').click()
  await expect(page.getByText('Connect your wallet')).toBeVisible()
})

test.afterEach(async ({ page }) => {
  await expect(page).not.toHaveTitle('Error')
})

test('should load qr code', async ({ page }) => {
  const content = page.getByTestId('partial-desktop-wallet-selection-content')
  await expect(content).toBeVisible()
  await expect(content.getByTestId('partial-qr-spinner')).not.toBeVisible()
  await expect(content.getByTestId('component-qrcode-svg')).toBeVisible()
})

test('should open explorer view', async ({ page }) => {
  await page.getByTestId('partial-all-wallets-button').click()
  await expect(page.getByTestId('view-wallet-explorer-header')).toBeVisible()
})

test('should search explorer view', async ({ page }) => {
  page.getByTestId('partial-all-wallets-button').click()
  await expect(page.getByTestId('view-wallet-explorer-header')).toBeVisible()
  await page.getByTestId('component-search-input').type('metamask')
  await expect(page.getByTestId('component-wallet-button-metamask')).toBeVisible()
  await expect(page.locator('w3m-wallet-button')).toHaveCount(1)
})

/*
 * TODO: update E2E api with sign-client for this test
 * test('should create valid uri', async ({ page }) => {
 *  const header = page.getByTestId('partial-desktop-wallet-selection-header')
 *  const uri = header.getByTestId('component-header-action-button').click()
 * })
 */

test.only('should search explorer view and then open wallet', async ({ page, context }) => {
  // open explorer page
  await page.getByTestId('partial-all-wallets-button').click()
  await expect(page.getByTestId('view-wallet-explorer-header')).toBeVisible()
  await expect(page.locator('w3m-wallet-button')).not.toHaveCount(0)
  await expect(page.locator('w3m-wallet-button')).not.toHaveCount(1)

  // search for wallet
  await page.getByTestId('component-search-input').type('metamask')
  await expect(page.getByTestId('component-search-input')).toHaveValue('metamask')
  const walletButton = page.getByTestId('component-wallet-button-metamask')

  await expect(walletButton).toBeVisible()
  await expect(page.locator('w3m-wallet-button')).toHaveCount(1)

  // "open" wallet (extension not installed)
  await walletButton.click()

  // ensure components loaded
  await expect(page.getByText(/MetaMask/)).toBeVisible()
  await expect(page.getByTestId('component-qrcode-svg')).toBeVisible()
  await expect(page.getByTestId('view-mobile-qr-connecting-footer')).toBeVisible()

  // attempt to open extension (should fail since not installed)
  const browserButton = page.locator('w3m-button', { hasText: 'Browser' })
  await expect(browserButton).toBeVisible()
  await browserButton.click()

  await expect(page.getByText(/Not Detected/)).toBeVisible()

  const downloadButton = page.getByTestId('view-install-wallet-download-button')
  await expect(downloadButton).toBeVisible()

  // open wallet download page
  const pagePromise = context.waitForEvent('page')
  await downloadButton.click()
  const newPage = await pagePromise
  await newPage.waitForLoadState()

  expect(page.url()).not.toBe(newPage.url())
  await expect(newPage).toHaveURL(/metamask/)
  await expect(page).not.toHaveURL('error')
})
