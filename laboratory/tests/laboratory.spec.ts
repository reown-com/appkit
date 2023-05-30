import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('h1')).toHaveText(/Web3Modal Lab/u)
})

test('can navigate to ManagedReact playground', async ({ page, baseURL }) => {
  await page.goto('./')
  await page.getByText('Go to playground').first().click()
  expect(page.url()).toBe(`${baseURL}/ManagedReact`)
  await expect(page.locator('h1')).toHaveText(/Web3Modal Lab/u)
})
