import { test, expect } from '@playwright/test'
import {
  connectToWallet,
  disconnectUsingModal,
  disconnectUsingWallet
} from './shared/util/web-examples'

// eslint-disable-next-line @typescript-eslint/require-await
test.describe('Functional tests', async () => {
  test.beforeEach(async ({ page, context, browserName }) => {
    await connectToWallet(page, context, browserName)

    return ''
  })
  test('should be able to connect to wallet', async ({ page, context, browserName }) => {
    await connectToWallet(page, context, browserName)
  })

  test('should send disconnect to wallet', async ({ page, context, browserName }) => {
    const walletPage = await connectToWallet(page, context, browserName)
    await disconnectUsingModal(page, walletPage)
  })

  test('should recieve disconnect from wallet', async ({ page, context, browserName }) => {
    const walletPage = await connectToWallet(page, context, browserName)
    await disconnectUsingWallet(page, walletPage)
  })

  test('should sign a message', async ({ page, context, browserName }) => {
    const walletPage = await connectToWallet(page, context, browserName)
    await page.getByTestId('lab-sign').click()

    await expect(walletPage.getByText('Sign Message')).toBeVisible()
    await walletPage.getByTestId('request-button-approve').click()

    await expect(page.getByText('Sign Message')).toBeVisible()
    await expect(page.getByText('0x')).toBeVisible()
  })

  test('should handle rejected sign', async ({ page, context, browserName }) => {
    const walletPage = await connectToWallet(page, context, browserName)
    await page.getByTestId('lab-sign').click()

    await expect(walletPage.getByText('Sign Message')).toBeVisible()
    await walletPage.getByTestId('request-button-reject').click()

    await expect(page.getByText('Sign Message')).toBeVisible()
    await expect(page.getByText(/User rejected/u)).toBeVisible()
  })

  test('should sign typed data', async ({ page, context, browserName }) => {
    const walletPage = await connectToWallet(page, context, browserName)
    await page.getByTestId('lab-sign-typed').click()

    await expect(walletPage.getByText('Sign Typed Data')).toBeVisible()
    await walletPage.getByTestId('request-button-approve').click()

    await expect(page.getByText('Sign Typed Data')).toBeVisible()
    await expect(page.getByText('0x')).toBeVisible()
  })

  test('should handle rejected sign typed data', async ({ page, context, browserName }) => {
    const walletPage = await connectToWallet(page, context, browserName)
    await page.getByTestId('lab-sign-typed').click()

    await expect(walletPage.getByText('Sign Typed Data')).toBeVisible()
    await walletPage.getByTestId('request-button-reject').click()

    await expect(page.getByText('Sign Typed Data')).toBeVisible()
    await expect(page.getByText(/User rejected/u)).toBeVisible()
  })
})
