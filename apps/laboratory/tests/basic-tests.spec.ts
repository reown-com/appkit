import { testM, expect } from './shared/fixtures/w3m-fixture'

testM.describe('Modal only tests', () => {
  testM('Should be able to open modal', async ({ modalPage }) => {
    await modalPage.page.getByTestId('connect-button').click()
    await expect(modalPage.page.getByTestId('all-wallets')).toBeVisible()
  })
})
