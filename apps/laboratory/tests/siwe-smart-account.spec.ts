import { testMEmailSiwe } from './shared/fixtures/w3m-email-fixture'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

testMEmailSiwe.beforeEach(async ({ modalValidator, modalPage }) => {
  const modalWaletValidator = modalValidator as ModalWalletValidator
  const modalWalletPage = modalPage as ModalWalletPage
  await modalWaletValidator.expectConnected()
  // Switch to supported network
  await modalWalletPage.openAccount()
  await modalWalletPage.openSettings()
  await modalWalletPage.switchNetwork('Polygon')
  await modalWalletPage.promptSiwe()
  await modalWalletPage.approveSign()
  await modalWaletValidator.expectSwitchedNetwork('Polygon')

  // Switch to smart account
  await modalWalletPage.togglePreferredAccountType()
  await modalWalletPage.promptSiwe()
  await modalWalletPage.approveSign()

  await modalWaletValidator.expectConnected()
})

testMEmailSiwe(
  'it should sign with siwe + smart account',
  async ({ modalPage, modalValidator }) => {
    const modalWaletValidator = modalValidator as ModalWalletValidator
    await modalPage.sign()
    await modalPage.approveSign()
    await modalWaletValidator.expectAcceptedSign()
  }
)

testMEmailSiwe(
  'it should reject sign with siwe + smart account',
  async ({ modalPage, modalValidator }) => {
    const modalWaletValidator = modalValidator as ModalWalletValidator
    await modalPage.sign()
    await modalPage.rejectSign()
    await modalWaletValidator.expectRejectedSign()
  }
)

testMEmailSiwe(
  'it should switch to an enabled network and sign',
  async ({ modalPage, modalValidator }) => {
    const modalWalletValidator = modalValidator as ModalWalletValidator
    const modalWalletPage = modalPage as ModalWalletPage
    const targetChain = 'Sepolia'
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
  }
)

testMEmailSiwe(
  'it should switch to a not enabled network and sign with EOA',
  async ({ modalPage, modalValidator }) => {
    const modalWalletValidator = modalValidator as ModalWalletValidator
    const modalWalletPage = modalPage as ModalWalletPage
    const targetChain = 'Ethereum'
    await modalWalletPage.openAccount()
    await modalWalletPage.openSettings()
    await modalWalletPage.switchNetwork(targetChain)
    /*
     * Flaky as network switch to non-enabled network changes network AND address causing 2 siwe popups
     * Test goes too fast and the second siwe popup is not handled
     */
    await modalWalletPage.page.waitForTimeout(1500)
    await modalWalletPage.promptSiwe()
    await modalWalletPage.approveSign()
    await modalWalletValidator.expectSwitchedNetwork(targetChain)
    // Shouldn't show the toggle on a non enabled network
    await modalWalletValidator.expectTogglePreferredTypeVisible(false)
    await modalWalletPage.closeModal()

    await modalWalletPage.sign()
    await modalWalletPage.approveSign()
    await modalWalletValidator.expectAcceptedSign()
  }
)

testMEmailSiwe('it should disconnect correctly', async ({ modalPage, modalValidator }) => {
  const modalWaletValidator = modalValidator as ModalWalletValidator
  const modalWalletPage = modalPage as ModalWalletPage

  await modalWalletPage.openAccount()
  await modalWalletPage.openSettings()
  await modalWalletPage.disconnect()
  await modalWaletValidator.expectDisconnected()
})
