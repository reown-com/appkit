import { testModalSmartAccount } from './shared/fixtures/w3m-smart-account-fixture'
import type { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { EOA, SMART_ACCOUNT } from './shared/validators/ModalWalletValidator'

import type { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

const NOT_ENABLED_EMAIL = 'test@w3ma.msdc.co'

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
  'it should switch to its smart account',
  async ({ modalPage, modalValidator }) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    await walletModalPage.openAccount()
    await walletModalValidator.expectActivateSmartAccountPromoVisible(true)

    await walletModalPage.openSettings()
    await walletModalValidator.expectChangePreferredAccountToShow(SMART_ACCOUNT)
    await walletModalPage.togglePreferredAccountType()
    await walletModalValidator.expectChangePreferredAccountToShow(EOA)
  }
)

testModalSmartAccount(
  'it should sign with its smart account',
  async ({ modalPage, modalValidator }) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    await walletModalPage.openAccount()
    await walletModalPage.openSettings()
    await walletModalPage.togglePreferredAccountType()
    await walletModalPage.closeModal()
    await walletModalPage.page.waitForTimeout(1000)

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

    await walletModalPage.openAccount()
    await walletModalPage.openSettings()

    const originalAddress = await walletModalPage.getAddress()

    await walletModalPage.togglePreferredAccountType()
    await walletModalValidator.expectChangePreferredAccountToShow(EOA)
    await walletModalPage.switchNetwork('Avalanche')
    await walletModalValidator.expectTogglePreferredTypeVisible(false)
    await walletModalPage.closeModal()
    await walletModalPage.page.waitForTimeout(1000)

    await walletModalPage.openAccount()
    await walletModalValidator.expectActivateSmartAccountPromoVisible(false)

    await walletModalPage.openSettings()
    await walletModalValidator.expectAddress(originalAddress)
  }
)

testModalSmartAccount(
  'it should use an eoa and not propose flow when disconnecting and connecting to a not enabled address',
  async ({ modalPage, modalValidator, context }) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    await walletModalPage.openAccount()
    await walletModalPage.openSettings()
    await walletModalPage.togglePreferredAccountType()
    await walletModalPage.disconnect()
    await walletModalPage.page.waitForTimeout(2500)

    await walletModalPage.emailFlow(NOT_ENABLED_EMAIL, context, mailsacApiKey)
    await walletModalPage.openAccount()
    await walletModalPage.openSettings()
    await walletModalPage.switchNetwork('Sepolia')
    await walletModalValidator.expectTogglePreferredTypeVisible(false)
    await walletModalPage.closeModal()
    await walletModalPage.page.waitForTimeout(1000)

    await walletModalPage.openAccount()
    await walletModalValidator.expectActivateSmartAccountPromoVisible(false)
  }
)
