import { test, type BrowserContext } from '@playwright/test'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import { EOA, ModalWalletValidator, SMART_ACCOUNT } from './shared/validators/ModalWalletValidator'

/* eslint-disable init-declarations */
let page: ModalWalletPage
let validator: ModalWalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const emailTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

emailTest.describe.configure({ mode: 'serial' })

emailTest.beforeAll(async ({ browser, library }) => {
  emailTest.setTimeout(300000)
  context = await browser.newContext()
  const browserPage = await context.newPage()

  page = new ModalWalletPage(browserPage, library, 'all')
  validator = new ModalWalletValidator(browserPage)

  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)

  // Switch to a SA enabled network
  const tempEmail = await email.getEmailAddressToUse()
  await page.emailFlow(tempEmail, context, mailsacApiKey)

  await validator.expectConnected()
})

emailTest.afterAll(async () => {
  await page.page.close()
})

// -- SIWE and regular tests ---------------------------------------------------
emailTest('it should sign siwe', async () => {
  await page.promptSiwe()
  await page.approveSign()
})

emailTest('it should sign', async () => {
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailTest('it should reject sign', async () => {
  await page.sign()
  await page.rejectSign()
  await validator.expectRejectedSign()
})

emailTest('it should switch network and sign', async ({ library }) => {
  let targetChain = 'Polygon'
  await page.goToSettings()
  await page.switchNetwork(targetChain)
  await page.promptSiwe()
  await page.approveSign()
  if (library === 'wagmi') {
    await page.goToSettings()
  }
  await validator.expectSwitchedNetwork(targetChain)
  await page.closeModal()
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()

  targetChain = 'Ethereum'
  await page.goToSettings()
  await page.switchNetwork(targetChain)
  await page.promptSiwe()
  await page.approveSign()
  if (library === 'wagmi') {
    await page.goToSettings()
  }
  await validator.expectSwitchedNetwork(targetChain)
  await page.closeModal()
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailTest('it should show loading on page refresh', async () => {
  await page.page.reload()
  await validator.expectConnectButtonLoading()
})

// -- Smart Account --------------------------------------------------------------
emailTest('it should use a smart account', async ({ library }) => {
  await validator.expectConnected()

  const targetChain = 'Polygon'
  await page.goToSettings()
  await page.switchNetwork(targetChain)
  await page.promptSiwe()
  await page.approveSign()
  if (library === 'wagmi') {
    await page.goToSettings()
  }
  await validator.expectSwitchedNetwork(targetChain)
  await page.closeModal()

  await page.openAccount()
  await validator.expectActivateSmartAccountPromoVisible(false)
  await page.openProfileView()
  await page.openSettings()
  await validator.expectChangePreferredAccountToShow(SMART_ACCOUNT)
  await page.closeModal()
})

emailTest('it should sign with smart account 6492 signature', async () => {
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()

  const signature = await page.getSignature()
  const address = await page.getAddress()
  const chainId = await page.getChainId()

  await validator.expectValidSignature(signature, address, chainId)
})

emailTest('it should switch to a not enabled network and sign with EOA', async ({ library }) => {
  const targetChain = 'Ethereum'
  await page.goToSettings()
  await page.switchNetwork(targetChain)
  await page.promptSiwe()
  await page.approveSign()
  if (library === 'wagmi') {
    // In wagmi, after switching network, it closes the modal
    await page.goToSettings()
  }
  await validator.expectSwitchedNetwork(targetChain)
  await page.closeModal()

  await page.goToSettings()
  await validator.expectTogglePreferredTypeVisible(false)
  await page.closeModal()

  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailTest('it should switch to smart account and sign', async ({ library }) => {
  const targetChain = 'Polygon'
  await page.goToSettings()
  await page.switchNetwork(targetChain)
  await page.promptSiwe()
  await page.approveSign()
  if (library === 'wagmi') {
    // In wagmi, after switching network, it closes the modal
    await page.goToSettings()
  }
  await validator.expectSwitchedNetwork(targetChain)
  await page.closeModal()

  await page.goToSettings()
  await page.togglePreferredAccountType()
  await page.promptSiwe()
  await page.approveSign()
  await page.goToSettings()
  await validator.expectChangePreferredAccountToShow(EOA)
  await page.closeModal()

  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()

  const signature = await page.getSignature()
  const address = await page.getAddress()
  const chainId = await page.getChainId()

  await validator.expectValidSignature(signature, address, chainId)
})

emailTest('it should switch to eoa and sign', async () => {
  await page.goToSettings()
  await page.togglePreferredAccountType()
  await page.promptSiwe()
  await page.approveSign()
  await page.goToSettings()
  await validator.expectChangePreferredAccountToShow(SMART_ACCOUNT)
  await page.closeModal()

  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailTest.skip('it should sendCalls and getCallsStatus', async () => {
  await page.sendCalls()
  await page.approveMultipleTransactions()
  await validator.expectAcceptedSign()

  const sendCallsId = await page.page.getByTestId('send-calls-id').textContent()

  await page.getCallsStatus(sendCallsId || '')

  await validator.expectCallStatusSuccessOrRetry(sendCallsId || '', true)
})

emailTest('it should disconnect correctly', async () => {
  await page.goToSettings()
  await page.disconnect()
  await validator.expectDisconnected()
})
