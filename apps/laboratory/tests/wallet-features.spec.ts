import { expect } from '@playwright/test'
import { testMEmail } from './shared/fixtures/w3m-email-fixture'

testMEmail.beforeEach(async ({ modalValidator }) => {
  await modalValidator.expectConnected()
})

testMEmail('it should initialize swap as expected', async ({ modalPage }) => {
  await modalPage.openAccount()
  const walletFeatureButton = await modalPage.getWalletFeaturesButton('swap')
  await walletFeatureButton.click()
  await expect(modalPage.page.getByTestId('swap-input-sourceToken')).toHaveValue('1')
  await expect(modalPage.page.getByTestId('swap-input-token-sourceToken')).toHaveText('ETH')
  await modalPage.page.getByTestId('swap-select-token-button-toToken').click()
  await modalPage.page
    .getByTestId('swap-select-token-search-input')
    .getByPlaceholder('Search token')
    .fill('USDC')
  await modalPage.page.getByTestId('swap-select-token-item-USDC').click()
  await expect(modalPage.page.getByTestId('swap-action-button')).toHaveText('Insufficient balance')
})

testMEmail('it should initialize onramp as expected', async ({ modalPage }) => {
  await modalPage.openAccount()
  const walletFeatureButton = await modalPage.getWalletFeaturesButton('onramp')
  await walletFeatureButton.click()
  await expect(modalPage.page.getByText('Coinbase')).toBeVisible()
})

testMEmail('it should initialize receive as expected', async ({ modalPage }) => {
  await modalPage.openAccount()
  const walletFeatureButton = await modalPage.getWalletFeaturesButton('receive')
  await walletFeatureButton.click()
  await modalPage.page.getByTestId('receive-address-copy-button').click()
  await expect(modalPage.page.getByText('Address copied')).toBeVisible()
})
