import { expect } from '@playwright/test'
import type { Page, BrowserContext } from '@playwright/test'

const WALLET_URL = 'http://localhost:3001'

export async function connectToWallet(page: Page, context: BrowserContext, browserName: string) {
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  }

  await page.goto('./with-wagmi/react')
  await page.getByTestId('partial-core-connect-button').click()
  await page.getByTestId('component-header-action-button').click()

  const walletPage = await context.newPage()
  walletPage.goto(WALLET_URL)
  await walletPage.waitForLoadState()

  await walletPage.getByTestId('wc-connect').click()

  const uriField = walletPage.getByTestId('uri-input')
  await expect(uriField).toBeVisible()

  const uriFieldButton = walletPage.getByTestId('uri-connect-button')
  await expect(uriFieldButton).toBeDisabled()

  await uriField.focus()
  await expect(uriField).toBeFocused()

  const isMac = process.platform === 'darwin'
  const modifier = isMac ? 'Meta' : 'Control'
  await walletPage.keyboard.press(`${modifier}+KeyV`)

  await expect(uriFieldButton).toBeVisible()
  await uriFieldButton.click()

  const approveButton = walletPage.getByTestId('session-approve-button')
  await expect(approveButton).toBeVisible()
  await expect(approveButton).toBeDisabled()

  /* Cannot select buttons because of next/ui */
  const account1Buttons = await walletPage
    .locator('[role=button]')
    .filter({ hasText: 'Account 1' })
    .all()
  await Promise.all(account1Buttons.map(async button => button.click()))

  await expect(approveButton).toHaveAttribute('data-state', 'ready')
  await expect(approveButton).toBeEnabled()

  /* Click does not work on this button due to next/ui */
  await approveButton.focus()
  await walletPage.keyboard.press('Space')

  await expect(page.getByText('0 ETH')).toBeVisible()

  return walletPage
}

export async function disconnectUsingModal(page: Page, walletPage: Page) {
  // Ensure that the wallet is connected
  await walletPage.getByTestId('sessions').click()
  const sessionCard = walletPage.getByTestId('session-card').first()
  await expect(sessionCard).toBeVisible()

  // Disconnect using web3modal
  await page.getByTestId('partial-account-address').click()
  await page.getByTestId('view-account-disconnect-button').click()

  // Ensure web3modal disconnects
  await expect(page.getByTestId('partial-connect-button')).toBeVisible()

  // Force wallet page to refresh
  await walletPage.reload()

  // Ensure that the wallet is disconnected
  await expect(sessionCard).not.toBeVisible()
}

export async function disconnectUsingWallet(page: Page, walletPage: Page) {
  // Ensure that the wallet is connected
  await walletPage.getByTestId('sessions').click()
  const sessionCard = walletPage.getByTestId('session-card').first()
  await expect(sessionCard).toBeVisible()

  // Disconnect using wallet
  await sessionCard.getByTestId('session-icon').click()
  await walletPage.getByTestId('session-delete-button').click()

  // Ensure web3modal disconnects
  await expect(page.getByTestId('partial-connect-button')).toBeVisible()

  // Force wallet page to refresh
  await walletPage.reload()

  // Ensure that the wallet is disconnected
  await expect(sessionCard).not.toBeVisible()
}
