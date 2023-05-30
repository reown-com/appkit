import { expect, test } from '@playwright/test'
import { openModal } from './openModal'

test('can click View All', async ({ page }) => {
  await openModal(page)
  await page.getByText('View All').click()
  await expect(page.locator('[placeholder="Search wallets"]')).toBeVisible()
})

test('can open Zerion', async ({ page }) => {
  await openModal(page)

  const zerionButton = page.locator('button', { hasText: 'Zerion' })
  await zerionButton.click()

  const appZerionIoPromise = page.waitForEvent('popup')

  const webButton = page.locator('button.w3m-outline').nth(1)
  await webButton.click()

  const appZerionIo = await appZerionIoPromise
  await expect(appZerionIo.getByText('Welcome to Zerion')).toBeVisible()
  await expect(
    appZerionIo.getByText('Connect an Ethereum wallet to manage your DeFi portfolio')
  ).toBeVisible()
})
