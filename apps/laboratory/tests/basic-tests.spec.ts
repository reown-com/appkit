import { testMExternal } from './shared/fixtures/w3m-external-fixture'
import { testM, expect } from './shared/fixtures/w3m-fixture'

testM.describe('Modal only tests', () => {
  testM('Should be able to open modal', async ({ modalPage }) => {
    await modalPage.page.getByTestId('connect-button').click()
    await expect(modalPage.page.getByTestId('all-wallets')).toBeVisible()
  })
})

testMExternal.describe('External connectors tests', () => {
  testMExternal('Should show external connectors', async ({ modalPage, modalValidator }) => {
    await modalPage.page.getByTestId('connect-button').click()
    await modalValidator.expectExternalVisible()
  })
})
