import { testModalSmartAccount } from './shared/fixtures/w3m-smart-account-fixture'
import type { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { EOA, SMART_ACCOUNT } from './shared/validators/ModalWalletValidator'

import type { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

const mailsacApiKey = process.env['MAILSAC_API_KEY']
if (!mailsacApiKey) {
  throw new Error('MAILSAC_API_KEY is not set')
}

testModalSmartAccount.beforeEach(async ({ modalPage, modalValidator }) => {
  const walletModalPage = modalPage as ModalWalletPage
  const walletModalValidator = modalValidator as ModalWalletValidator

  await modalValidator.expectConnected()
  await walletModalPage.openAccount()
  await walletModalValidator.expectActivateSmartAccountPromoVisible(false)

  await walletModalPage.openProfileView()
  await walletModalPage.openSettings()
  await walletModalValidator.expectChangePreferredAccountToShow(EOA)
  await walletModalPage.closeModal()
})

testModalSmartAccount('it should sign with 6492', async ({ modalPage, modalValidator }) => {
  const walletModalPage = modalPage as ModalWalletPage
  const walletModalValidator = modalValidator as ModalWalletValidator

  await walletModalPage.sign()
  await walletModalPage.approveSign()
  await walletModalValidator.expectAcceptedSign()

  const signature = await walletModalPage.getSignature()
  const address = await walletModalPage.getAddress()
  const chainId = await walletModalPage.getChainId()

  await walletModalValidator.expectValidSignature(signature, address, chainId)
})

testModalSmartAccount(
  'it should switch to its eoa and sign',
  async ({ modalPage, modalValidator }) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    await walletModalPage.openAccount()
    await walletModalPage.openProfileView()
    await walletModalPage.openSettings()

    await walletModalPage.togglePreferredAccountType()
    await walletModalValidator.expectChangePreferredAccountToShow(SMART_ACCOUNT)

    await walletModalPage.closeModal()

    await walletModalPage.sign()
    await walletModalPage.approveSign()
    await walletModalValidator.expectAcceptedSign()

    const signature = await walletModalPage.getSignature()
    const address = await walletModalPage.getAddress()
    const chainId = await walletModalPage.getChainId()

    await walletModalValidator.expectValidSignature(signature, address, chainId)
  }
)

testModalSmartAccount(
  'it should return to an eoa when switching to a non supported network',
  async ({ modalPage, modalValidator }) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    const originalAddress = await walletModalPage.getAddress()

    await walletModalPage.openAccount()
    await walletModalPage.openProfileView()
    await walletModalPage.openSettings()

    await walletModalPage.switchNetwork('Avalanche')
    await modalValidator.expectSwitchedNetwork('Avalanche')
    await walletModalValidator.expectTogglePreferredTypeVisible(false)
    await walletModalPage.closeModal()

    await walletModalPage.openAccount()
    await walletModalValidator.expectActivateSmartAccountPromoVisible(false)
    await walletModalPage.closeModal()

    await walletModalValidator.expectChangedAddressAfterSwitchingAccountType(originalAddress)
  }
)
