import { expect } from '@playwright/test'
import { testMEmail } from './shared/fixtures/w3m-email-fixture'
import { SECURE_WEBSITE_URL } from './shared/constants'
import type { ModalWalletPage } from './shared/pages/ModalWalletPage'
import type { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

testMEmail.beforeEach(async ({ modalValidator }) => {
  await modalValidator.expectConnected()
})

testMEmail('it should sign', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})

testMEmail('it should upgrade wallet', async ({ modalPage, context }) => {
  const page = await modalPage.clickWalletUpgradeCard(context)
  expect(page.url()).toContain(SECURE_WEBSITE_URL)
  await page.close()
})

testMEmail('it should reject sign', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.rejectSign()
  await modalValidator.expectRejectedSign()
})

testMEmail('it should switch network and sign', async ({ modalPage, modalValidator }) => {
  let targetChain = 'Polygon'
  const walletModalPage = modalPage as ModalWalletPage
  const walletModalValidator = modalValidator as ModalWalletValidator
  await walletModalPage.openAccount()
  await walletModalPage.openSettings()
  await walletModalPage.switchNetwork(targetChain)
  await walletModalValidator.expectSwitchedNetwork(targetChain)
  await walletModalPage.closeModal()
  await walletModalPage.sign()
  await walletModalPage.approveSign()
  await walletModalValidator.expectAcceptedSign()

  targetChain = 'Ethereum'
  await walletModalPage.openAccount()
  await walletModalPage.openSettings()
  await walletModalPage.switchNetwork(targetChain)
  await walletModalValidator.expectSwitchedNetwork(targetChain)
  await walletModalPage.closeModal()
  await walletModalPage.sign()
  await walletModalPage.approveSign()
  await walletModalValidator.expectAcceptedSign()
})

testMEmail('it should disconnect correctly', async ({ modalPage, modalValidator }) => {
  const walletModalPage = modalPage as ModalWalletPage
  const walletModalValidator = modalValidator as ModalWalletValidator
  await walletModalPage.openAccount()
  await walletModalPage.openSettings()
  await walletModalPage.disconnect()
  await walletModalValidator.expectDisconnected()
})
