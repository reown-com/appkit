import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function openModal(page: Page) {
  await page.goto('./with-wagmi/react')
  await expect(page.getByText('Connect your wallet')).not.toBeVisible()
  await page.getByText('Connect Wallet').click({ force: true })
  await expect(page.getByText('Connect your wallet')).toBeVisible()
}
