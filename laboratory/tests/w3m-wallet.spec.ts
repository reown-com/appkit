import { testMW, expect } from './shared/fixtures/w3m-wallet-fixture'
import { connect } from './shared/util/w3m-wallet-utils'
testMW.describe('W3M using wallet web-example', () => {
  testMW.beforeEach(async ({ modalPage, walletPage }) => {
    await connect(modalPage, walletPage)
  })

  testMW('Should be able to connect', ({ modalPage, walletPage }) => {
    expect(modalPage).toBeDefined()
    expect(walletPage).toBeDefined()
  })

  testMW('Should send disconnect to wallet', async ({ modalPage }) => {
    await modalPage.disconnect()
    // UI validation methods would go here for modal AND wallet
  })
  testMW('Should recieve disconnect from a wallet', async ({ walletPage }) => {
    await walletPage.disconnect()
    // UI validation methods would go here for modal AND wallet
  })

  testMW('Should sign a message', async ({ modalPage, walletPage }) => {
    await modalPage.page.getByTestId('lab-sign').click()

    await expect(walletPage.page.getByText('Sign Message')).toBeVisible()
    await walletPage.page.getByTestId('request-button-approve').click()

    await expect(modalPage.page.getByText('Sign Message')).toBeVisible()
    await expect(modalPage.page.getByText('0x')).toBeVisible()
  })
})
