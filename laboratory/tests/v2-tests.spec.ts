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
  await page.goto('./with-wagmi/react')
  await expect(page.getByText('Connect your wallet')).not.toBeVisible()
  await page.getByTestId('partial-core-connect-button').click()
  await expect(page.getByText('Connect your wallet')).toBeVisible()
})

test.afterEach(async ({ page }) => {
  await expect(page).not.toHaveTitle('Error')
})

test('should open explorer view', async ({ page }) => {
  await page.getByTestId('partial-all-wallets-button').click()
  await expect(page.getByTestId('view-wallet-explorer-header')).toBeVisible()
})

test('should load qr code', async ({ page }) => {
  const content = page.getByTestId('partial-desktop-wallet-selection-content')
  await expect(content).toBeVisible()
  await expect(content.getByTestId('partial-qr-spinner')).not.toBeVisible()
  await expect(content.getByTestId('component-qrcode-svg')).toBeVisible()
})

// Test('should create valid uri', async ({ page }) => {
//   Const header = page.getByTestId('partial-desktop-wallet-selection-header')
//   Const uri = header.getByTestId('component-header-action-button').click()
//   /* expect(uri).toContain('wc:') */
// })
