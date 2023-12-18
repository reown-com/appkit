import { testM, expect } from './shared/fixtures/w3m-fixture'

testM.describe('Modal only tests', () => {
  testM('Should be able to open modal', async ({ modalPage }) => {
    await modalPage.page.getByText('Connect Wallet').click()
    await expect(modalPage.page.getByText('All Wallets')).toBeVisible()
  })
})
