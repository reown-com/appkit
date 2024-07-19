import { expect } from '@playwright/test'
import { testMSocial } from './shared/fixtures/w3m-social-fixture'
import type { ModalWalletPage } from './shared/pages/ModalWalletPage'

testMSocial.beforeEach(async ({ modalValidator }) => {
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
