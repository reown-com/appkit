import { Page, expect } from '@playwright/test'

export async function openModal(page: Page) {
  await page.goto('./ManagedReact')
  await expect(page.getByText('Connect your wallet')).not.toBeVisible()
  await page.getByText('Connect Wallet').click({ force: true })
  await expect(page.getByText('Connect your wallet')).toBeVisible()
}
