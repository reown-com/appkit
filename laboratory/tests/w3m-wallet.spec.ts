import { testMW, expect } from './shared/fixtures/w3m-wallet-fixture'
import { connect } from './shared/util/w3m-wallet-utils'
testMW.describe('W3M using wallet web-example', () => {
  testMW.beforeEach(async ({ modalPage, walletPage }) => {
    await connect(modalPage, walletPage)
  })

  testMW('Should be able to connect', async ({ modalPage, walletPage }) => {
    expect(modalPage).toBeDefined()
    expect(walletPage).toBeDefined()
    await expect(modalPage.page.getByText('0 ETH')).toBeVisible()
  })

  testMW('Should send disconnect to wallet', async ({ modalPage }) => {
    await modalPage.disconnect()
    // UI validation methods would go here for modal AND wallet
  })
  testMW('Should recieve disconnect from a wallet', async ({ modalPage, walletPage }) => {
    await walletPage.disconnect()
    // UI validation methods would go here for modal AND wallet
    await expect(modalPage.page.getByText('0 ETH')).not.toBeVisible()
  })

  testMW('Should sign a message', async ({ modalPage, walletPage }) => {
    await modalPage.page.getByTestId('lab-sign').click()

    await expect(walletPage.page.getByText('Sign Message')).toBeVisible()
    await walletPage.page.getByTestId('request-button-approve').click()

    await expect(modalPage.page.getByText('Sign Message')).toBeVisible()
    await expect(modalPage.page.getByText('0x')).toBeVisible()
  })

  testMW('Should handle rejected sign', async ({ modalPage, walletPage }) => {
    await modalPage.page.getByTestId('lab-sign').click()

    await expect(walletPage.page.getByText('Sign Message')).toBeVisible()
    await walletPage.page.getByTestId('request-button-reject').click()

    await expect(modalPage.page.getByText('Sign Message')).toBeVisible()
    await expect(modalPage.page.getByText(/User rejected/u)).toBeVisible()
  })

  testMW('should sign typed data', async ({ modalPage, walletPage }) => {
    await modalPage.page.getByTestId('lab-sign-typed').click()

    await expect(walletPage.page.getByText('Sign Typed Data')).toBeVisible()
    await walletPage.page.getByTestId('request-button-approve').click()

    await expect(modalPage.page.getByText('Sign Typed Data')).toBeVisible()
    await expect(modalPage.page.getByText('0x')).toBeVisible()
  })

  testMW('should handle rejected sign typed data', async ({ modalPage, walletPage }) => {
    await modalPage.page.getByTestId('lab-sign-typed').click()

    await expect(walletPage.page.getByText('Sign Typed Data')).toBeVisible()
    await walletPage.page.getByTestId('request-button-reject').click()

    await expect(modalPage.page.getByText('Sign Typed Data')).toBeVisible()
    await expect(modalPage.page.getByText(/User rejected/u)).toBeVisible()
  })

  testMW('should handle chain switch', async ({ modalPage, walletPage }) => {
    await modalPage.page.getByTestId('partial-network-switch-button').click()
    await modalPage.page.getByText(/Polygon/u).click()
    await modalPage.page.getByTestId('backcard-close').click()
    await modalPage.page.getByTestId('lab-sign').click()

    await expect(walletPage.page.getByText('Sign Message')).toBeVisible()

    await expect(walletPage.page.getByTestId('request-details-chain')).toHaveText('Polygon')
  })
})
