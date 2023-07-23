import { expect, test } from '@playwright/test'
import {
  openWalletFromExplorer,
  testWalletMobileView,
  testWalletDesktopView,
  testWalletInstallView
} from './shared/util/explorer'

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
