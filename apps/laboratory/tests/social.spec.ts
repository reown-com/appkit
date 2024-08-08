/**
 * Social tests are still blocked because we are having authorization issues with them.
 * Some options like Google, Discord have human verification and passing them with the Playwright environment is not an easy pick (or not quite possible).
 * GitHub doesn't have human verification but when running the tests in parallel, it's getting stuck too much and not passing.
 * We are going to keep this test file here for future reference and when we have a better solution for this, we can enable them.
 */
import { expect } from '@playwright/test'
import { testMSocial } from './shared/fixtures/w3m-social-fixture'
import type { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { ModalValidator } from './shared/validators/ModalValidator'

testMSocial.beforeEach(async ({ modalPage }) => {
  const modalValidator = new ModalValidator(modalPage.page)
  await modalValidator.expectConnected()
})

testMSocial('it should connect with GitHub, switch network and sign', async ({ modalPage }) => {
  const targetChain = 'Polygon'
  const modalWalletPage = modalPage as ModalWalletPage

  const networkButton = modalWalletPage.page.getByTestId('w3m-network-button')
  await networkButton.click()

  const networkToSwitchButton = modalWalletPage.page.getByTestId(
    `w3m-network-switch-${targetChain}`
  )
  await networkToSwitchButton.click()
  await networkToSwitchButton.waitFor({ state: 'hidden' })
  await expect(networkButton).toHaveText(targetChain)
})
