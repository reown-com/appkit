import { expect, test } from '@playwright/test'
import { openModal } from './openModal'

test('has Connect Wallet button', async ({ page }) => {
  await page.goto('./with-wagmi/react')
  await expect(page.getByText('Connect Wallet')).toBeVisible()
})

test('can open modal with Connect Wallet', async ({ page }) => {
  await openModal(page)
})
