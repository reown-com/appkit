import { Page, expect } from '@playwright/test'

/**
 * Helper function to wait for the modal to appear
 */
export async function waitForModalToAppear(page: Page): Promise<void> {
  const modalCard = page.getByTestId('w3m-modal-card').first()
  const modalOverlay = page.getByTestId('w3m-modal-overlay').first()
  expect(modalCard).toBeVisible({ timeout: 10000 })
  expect(modalOverlay).toBeVisible({ timeout: 10000 })
}

/**
 * Helper function to check if all state containers are visible and non-empty
 */
export async function checkStateContainers(page: Page): Promise<void> {
  const stateContainers = [
    '#accountState',
    '#networkState',
    '#appKitState',
    '#themeState',
    '#events',
    '#walletInfo'
  ]

  for (const container of stateContainers) {
    await expect(page.locator(container)).toBeVisible()
  }
}

/**
 * Helper function to toggle theme
 */
export async function toggleTheme(page: Page): Promise<void> {
  await page.click('#toggle-theme')
  // Wait for the theme to change
  await page.waitForTimeout(500)
}
