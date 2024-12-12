import { expect, test, type BrowserContext } from '@playwright/test'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import { ModalWalletValidator } from './shared/validators/ModalWalletValidator'

/* eslint-disable init-declarations */
let page: ModalWalletPage
let validator: ModalWalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

const ABSOLUTE_WALLET_ID = 'bfa6967fd05add7bb2b19a442ac37cedb6a6b854483729194f5d7185272c5594'
const METAMASK_WALLET_ID = 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'

// -- Setup --------------------------------------------------------------------
const walletFeaturesTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

walletFeaturesTest.describe.configure({ mode: 'serial' })

walletFeaturesTest.beforeAll(async ({ browser, browserName, library }) => {
  walletFeaturesTest.setTimeout(300000)

  if (browserName === 'chromium') {
    context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] })
  } else {
    context = await browser.newContext()
  }
  const browserPage = await context.newPage()

  page = new ModalWalletPage(browserPage, library, 'default')
  validator = new ModalWalletValidator(browserPage)

  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)
  const tempEmail = await email.getEmailAddressToUse()

  // Iframe should not be injected until needed
  validator.expectSecureSiteFrameNotInjected()
  await page.emailFlow(tempEmail, context, mailsacApiKey)

  await validator.expectConnected()
})

walletFeaturesTest.afterAll(async () => {
  await page.page.close()
})

walletFeaturesTest('it should initialize swap as expected', async () => {
  await page.openAccount()
  const walletFeatureButton = await page.getWalletFeaturesButton('swaps')
  await walletFeatureButton.click()
  await expect(page.page.getByTestId('swap-input-sourceToken')).toHaveValue('1')
  await expect(page.page.getByTestId('swap-input-token-sourceToken')).toHaveText('ETH')
  await page.page.getByTestId('swap-select-token-button-toToken').click()
  await page.page
    .getByTestId('swap-select-token-search-input')
    .getByPlaceholder('Search token')
    .fill('USDC')
  await page.page.getByTestId('swap-select-token-item-USDC').click()
  await expect(page.page.getByTestId('swap-action-button')).toHaveText('Insufficient balance')
  await page.closeModal()
})

walletFeaturesTest('it should initialize onramp as expected', async () => {
  await page.openAccount()
  const walletFeatureButton = await page.getWalletFeaturesButton('onramp')
  await walletFeatureButton.click()
  await expect(page.page.getByText('Coinbase')).toBeVisible()
  await page.closeModal()
})

walletFeaturesTest('it should find account name as expected', async () => {
  await page.goToSettings()
  await page.openChooseNameIntro()
  await page.openChooseName()
  await page.typeName('test-ens-check')
  await validator.expectAccountNameFound('test-ens-check')
  await page.clickAccountName('test-ens-check')
  await validator.expectHeaderText('Approve Transaction')
  await validator.expectAccountNameApproveTransaction('test-ens-check.reown.id')
  await page.closeModal()
})

walletFeaturesTest('it should open web app wallet', async () => {
  await page.goToSettings()
  await page.disconnect()
  await page.openConnectModal()
  await validator.expectAllWallets()
  await page.openAllWallets()
  await page.page.waitForTimeout(500)
  await page.search('absolute wallet')
  await page.clickAllWalletsListSearchItem(ABSOLUTE_WALLET_ID)
  await page.page.waitForTimeout(500)
  await page.clickTabWebApp()
  const copiedLink = await page.clickCopyLink()
  const url = await page.clickOpenWebApp()
  validator.expectQueryParameterFromUrl({
    url,
    key: 'uri',
    value: copiedLink
  })
  await page.closeModal()
})

walletFeaturesTest('it should search for a certified wallet', async () => {
  await page.openConnectModal()
  await validator.expectAllWallets()
  await page.openAllWallets()
  await page.clickCertifiedToggle()
  await page.page.waitForTimeout(500)
  await validator.expectAllWalletsListSearchItem(METAMASK_WALLET_ID)

  // Try searching for a certified wallet while toggle is on
  await page.search('MetaMask')
  await validator.expectAllWalletsListSearchItem(METAMASK_WALLET_ID)

  // Try searching for a certified wallet while toggle is off
  await page.clickCertifiedToggle()
  await page.search('MetaMask')
  await validator.expectAllWalletsListSearchItem(METAMASK_WALLET_ID)
})
