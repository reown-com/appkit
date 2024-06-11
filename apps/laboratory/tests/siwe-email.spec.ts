import { testMEmailSiwe } from './shared/fixtures/w3m-email-fixture'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

testMEmailSiwe.beforeEach(async ({ modalValidator }) => {
  const modalWaletValidator = modalValidator as ModalWalletValidator
  await modalWaletValidator.expectConnected()
})

testMEmailSiwe('it should sign with email', async ({ modalPage, modalValidator }) => {
  const modalWaletValidator = modalValidator as ModalWalletValidator
  await modalPage.sign()
  await modalPage.approveSign()
  await modalWaletValidator.expectAcceptedSign()
})

testMEmailSiwe('it should reject sign in with email', async ({ modalPage, modalValidator }) => {
  const modalWaletValidator = modalValidator as ModalWalletValidator
  await modalPage.sign()
  await modalPage.rejectSign()
  await modalWaletValidator.expectRejectedSign()
})

testMEmailSiwe('it should switch network and sign', async ({ modalPage, modalValidator }) => {
  const modalWalletValidator = modalValidator as ModalWalletValidator
  const modalWalletPage = modalPage as ModalWalletPage
  let targetChain = 'Polygon'
  await modalWalletPage.openAccount()
  await modalWalletPage.openSettings()
  await modalWalletPage.switchNetwork(targetChain)
  await modalWalletPage.promptSiwe()
  await modalWalletPage.approveSign()
  await modalWalletValidator.expectSwitchedNetwork(targetChain, true)
  await modalWalletPage.closeModal()

  await modalWalletPage.sign()
  await modalWalletPage.approveSign()
  await modalWalletValidator.expectAcceptedSign()

  targetChain = 'Ethereum'
  await modalWalletPage.openAccount()
  await modalWalletPage.openSettings()
  await modalWalletPage.switchNetwork(targetChain)
  await modalWalletPage.promptSiwe()
  await modalWalletPage.approveSign()
  await modalWalletValidator.expectSwitchedNetwork(targetChain)
  await modalWalletPage.closeModal()

  await modalWalletPage.sign()
  await modalWalletPage.approveSign()
  await modalWalletValidator.expectAcceptedSign()
})

testMEmailSiwe('it should disconnect correctly', async ({ modalPage, modalValidator }) => {
  const modalWaletValidator = modalValidator as ModalWalletValidator
  const modalWalletPage = modalPage as ModalWalletPage

  await modalWalletPage.openAccount()
  await modalWalletPage.openSettings()
  await modalWalletPage.disconnect()
  await modalWaletValidator.expectDisconnected()
})
