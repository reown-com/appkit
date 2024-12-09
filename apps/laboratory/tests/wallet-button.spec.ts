import { test, type BrowserContext } from '@playwright/test'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'
import { WalletPage } from './shared/pages/WalletPage'
import { DEFAULT_SESSION_PARAMS } from './shared/constants'

const WALLET_CONNECT_TEST_ID = 'walletConnect'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let context: BrowserContext
let walletPage: WalletPage

// -- Setup --------------------------------------------------------------------
const walletButtonTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

walletButtonTest.describe.configure({ mode: 'serial' })

walletButtonTest.beforeAll(async ({ browser, library }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'wallet-button')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
  await walletPage.load()
})

// -- Tests --------------------------------------------------------------------
walletButtonTest('it should be able to connect with QR code', async () => {
  await modalValidator.expectWalletButtonHook(WALLET_CONNECT_TEST_ID, false)
  await modalPage.clickWalletButton(WALLET_CONNECT_TEST_ID)
  const uri = await modalPage.getConnectUriFromQRModal()
  await walletPage.connectWithUri(uri)
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  await modalValidator.expectConnected()
})

walletButtonTest('it should be connected after page refresh', async () => {
  await modalPage.page.reload()
  await modalValidator.expectConnected()
  await modalValidator.expectWalletButtonHook(WALLET_CONNECT_TEST_ID, true)
})
