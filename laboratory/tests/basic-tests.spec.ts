import { testM, expect } from './shared/fixtures/w3m-fixture'

testM.describe('Modal only tests', () => {
  testM('Should be able to open modal', async ({ modalPage }) => {
    await modalPage.page.getByTestId('partial-core-connect-button').click()
    await expect(modalPage.page.getByTestId('component-header-action-button')).toBeVisible()
  })
})
