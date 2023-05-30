import { expect, test } from '@playwright/test'
import { openModal } from './openModal'

test('can click View All', async ({ page }) => {
  await openModal(page)
  await page.getByText('View All').click()
  await expect(page.locator('[placeholder="Search wallets"]')).toBeVisible()
})

test('can click (?)', async ({ page }) => {
  await openModal(page)
  await expect(page.locator('w3m-modal-content')).not.toContainText(
    'A home for your digital assets'
  )
  await page.locator('.w3m-toolbar').locator('button').first().click()
  await expect(page.locator('[title="What is a wallet?"]')).toBeVisible()
  await expect(page.locator('[title="What is a wallet?"]')).toContainText('What is a wallet?')
  await expect(page.locator('w3m-modal-content')).toContainText('A home for your digital assets')
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
