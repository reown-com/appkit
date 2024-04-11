import { testModalSmartAccount } from './shared/fixtures/w3m-smart-account-fixture'
import type { ModalWalletPage } from './shared/pages/ModalWalletPage'
import type { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

const NOT_ENABLED_SMART_ACCOUNT_INDEX = 10
const NOT_ENABLED_SMART_ACCOUNT = 'test@w3ma.msdc.co'

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
  async ({ modalPage, modalValidator }, testInfo) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    await walletModalPage.togglePreferredAccountType()
    await walletModalPage.openSettings()
    await walletModalValidator.expectSmartAccountAddress(testInfo.parallelIndex)
  }
)

testModalSmartAccount(
  'it should sign with its smart account',
  async ({ modalPage, modalValidator }) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    await walletModalPage.togglePreferredAccountType()

    await walletModalPage.sign()
    await walletModalPage.approveSign()
    await walletModalValidator.expectAcceptedSign()
  }
)

testModalSmartAccount(
  'it should return to an eoa when switching to a non supported network',
  async ({ modalPage, modalValidator }, testInfo) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    await walletModalPage.togglePreferredAccountType()
    await walletModalPage.switchNetwork('Avalanche')
    await walletModalPage.openSettings()
    await walletModalValidator.expectEoaAddress(testInfo.parallelIndex)
  }
)

testModalSmartAccount(
  'it should use an eoa when disconnecting and connecting to a not enabled address',
  async ({ modalPage, modalValidator, context }) => {
    const walletModalPage = modalPage as ModalWalletPage
    const walletModalValidator = modalValidator as ModalWalletValidator

    await walletModalPage.togglePreferredAccountType()
    await walletModalPage.disconnect()
    await walletModalPage.page.waitForTimeout(2500)

    await walletModalPage.emailFlow(NOT_ENABLED_SMART_ACCOUNT, context, mailsacApiKey)
    await walletModalPage.switchNetwork('Sepolia')
    await walletModalPage.openSettings()

    await walletModalValidator.expectEoaAddress(NOT_ENABLED_SMART_ACCOUNT_INDEX)
  }
)
