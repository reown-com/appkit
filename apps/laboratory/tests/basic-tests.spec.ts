import { testMExternal } from './shared/fixtures/w3m-external-fixture'
import { testM, expect } from './shared/fixtures/w3m-fixture'
import { ModalValidator } from './shared/validators/ModalValidator'

testM.describe('Modal only tests', () => {
  testM('Should be able to open modal', async ({ modalPage }) => {
    await modalPage.page.getByTestId('connect-button').click()
    await expect(modalPage.page.getByTestId('all-wallets')).toBeVisible()
  })

  testM('Should be able to open modal with the open hook', async ({ modalPage }) => {
    const openHookButton = modalPage.page.getByTestId('w3m-open-hook-button')
    await openHookButton.click()
    await expect(modalPage.page.getByTestId('all-wallets')).toBeVisible()
  })

  testM.only('Should show socials enabled by default', async ({ modalPage }) => {
    const modalValidator = new ModalValidator(modalPage.page)
    await modalPage.page.getByTestId('connect-button').click()
    await modalValidator.expectSocialsVisible()
  })
})

testMExternal.describe('External connectors tests', () => {
  testMExternal('Should show external connectors', async ({ modalPage }) => {
    const modalValidator = new ModalValidator(modalPage.page)
    await modalPage.page.getByTestId('connect-button').click()
    await modalValidator.expectExternalVisible()
  })
})
