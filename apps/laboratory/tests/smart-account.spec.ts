import { testModalSmartAccount } from './shared/fixtures/w3m-smart-account-fixture'
import type { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { EOA, SMART_ACCOUNT } from './shared/validators/ModalWalletValidator'

import type { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

const mailsacApiKey = process.env['MAILSAC_API_KEY']
if (!mailsacApiKey) {
  throw new Error('MAILSAC_API_KEY is not set')
}

testModalSmartAccount.beforeEach(async ({ modalValidator }) => {
  await modalValidator.expectConnected()
})

testModalSmartAccount('it should sign with eoa', async ({ modalPage, modalValidator }) => {
  await modalPage.sign()
  await modalPage.approveSign()
  await modalValidator.expectAcceptedSign()
})

testModalSmartAccount(
  'it should switch to its smart account and sign',
  async ({ modalPage, modalValidator }) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    await walletModalPage.openAccount()
    await walletModalValidator.expectActivateSmartAccountPromoVisible(true)

    await walletModalPage.openSettings()
    await walletModalValidator.expectChangePreferredAccountToShow(SMART_ACCOUNT)
    await walletModalPage.togglePreferredAccountType()
    await walletModalValidator.expectChangePreferredAccountToShow(EOA)

    await walletModalPage.closeModal()

    await walletModalPage.sign()
    await walletModalPage.approveSign()
    await walletModalValidator.expectAcceptedSign()
  }
)

testModalSmartAccount(
  'it should return to an eoa when switching to a non supported network',
  async ({ modalPage, modalValidator }) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    const originalAddress = await walletModalPage.getAddress()

    await walletModalPage.openAccount()
    await walletModalPage.openSettings()

    await walletModalPage.togglePreferredAccountType()
    await walletModalValidator.expectChangePreferredAccountToShow(EOA)
    await walletModalPage.switchNetwork('Avalanche')
    await modalValidator.expectSwitchedNetwork('Avalanche')
    await walletModalValidator.expectTogglePreferredTypeVisible(false)
    await walletModalPage.closeModal()

    await walletModalPage.openAccount()
    await walletModalValidator.expectActivateSmartAccountPromoVisible(false)
    await walletModalPage.closeModal()

    await walletModalValidator.expectAddress(originalAddress)
  }
)

testModalSmartAccount(
  'it should properly sign with a 6492 signature',
  async ({ modalPage, modalValidator }) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    await walletModalPage.openAccount()
    await walletModalPage.openSettings()
    await walletModalPage.togglePreferredAccountType()
    await walletModalValidator.expectChangePreferredAccountToShow(EOA)
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
