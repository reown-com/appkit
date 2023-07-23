import { expect, test } from '@playwright/test'

// eslint-disable-next-line @typescript-eslint/require-await
test.describe('Basic tests', async () => {
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
})
