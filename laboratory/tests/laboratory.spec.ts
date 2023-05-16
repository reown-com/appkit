import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('h1')).toHaveText(/Web3Modal Lab/u)
})

test('can navigate to ManagedReact playground', async ({ page }) => {
  await page.goto('./')
  await page.getByText('Go to playground').first().click()
  expect(page.url()).toBe('http://127.0.0.1:3000/ManagedReact')
  await expect(page.locator('h1')).toHaveText(/Web3Modal Lab/u)
})

test('can open modal with Connect Wallet', async ({ page }) => {
  await page.goto('./ManagedReact')
  await expect(page.getByText('Connect your wallet')).not.toBeVisible()
  await page.getByText('Connect Wallet').click({ force: true })
  await expect(page.getByText('Connect your wallet')).toBeVisible()
})

test('can click View All', async ({ page }) => {
  await page.goto('./ManagedReact')
  await expect(page.getByText('Connect your wallet')).not.toBeVisible()
  await page.getByText('Connect Wallet').click({ force: true })
  await expect(page.getByText('Connect your wallet')).toBeVisible()
  await page.getByText('View All').click()
  await expect(page.locator('[placeholder="Search wallets"]')).toBeVisible()
})
