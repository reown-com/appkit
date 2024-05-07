import { testMEmailSiwe } from './shared/fixtures/w3m-email-fixture'
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
  let targetChain = 'Polygon'
  await modalPage.switchNetwork(targetChain)
  await modalWalletValidator.expectSwitchedNetwork(targetChain)
  await modalPage.closeModal()
  await modalPage.sign()
  await modalPage.approveSign()
  await modalWalletValidator.expectAcceptedSign()

  targetChain = 'Ethereum'
  await modalPage.switchNetwork(targetChain)
  await modalWalletValidator.expectSwitchedNetwork(targetChain)
  await modalPage.closeModal()
  await modalPage.sign()
  await modalPage.approveSign()
  await modalWalletValidator.expectAcceptedSign()
})

testMEmailSiwe('it should disconnect correctly', async ({ modalPage, modalValidator }) => {
  const modalWaletValidator = modalValidator as ModalWalletValidator
  await modalPage.disconnect()
  await modalWaletValidator.expectDisconnected()
})
