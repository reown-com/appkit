import { type BrowserContext, test } from '@playwright/test'

import { WalletPage, WalletValidator } from '@reown/appkit-testing'
import { DEFAULT_CHAIN_NAME } from '@reown/appkit-testing'
import { polygon, solana } from '@reown/appkit/networks'

import { ModalPage } from '../shared/pages/ModalPage'
import { ModalValidator } from '../shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let walletPage: WalletPage
let walletValidator: WalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, 'multichain-no-adapters', 'default')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(browserPage)
  walletValidator = new WalletValidator(walletPage)

  await modalPage.load()
  await modalPage.qrCodeFlow({
    page: modalPage,
    walletPage,
    qrCodeFlowType: 'immediate-connect'
  })
  await modalValidator.expectConnected()
})

test.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
test('it should switch networks and sign', async () => {
  const chains = ['Polygon', 'Solana']

  async function processChain(index: number) {
    if (index >= chains.length) {
      return
    }

    const chainName = chains[index] ?? DEFAULT_CHAIN_NAME
    const network = chainName === 'Solana' ? `solana:${solana.id}` : `eip155:${polygon.id}`
    await modalPage.switchNetwork(chainName)
    await modalValidator.expectSwitchedNetwork(chainName)
    await modalPage.closeModal()

    // -- Sign ------------------------------------------------------------------
    await modalPage.sign('upa')
    await walletValidator.expectReceivedSign({ network })
    await modalValidator.expectAcceptedSign()

    await processChain(index + 1)
  }

  // Start processing from the first chain
  await processChain(0)
})

test('it should disconnect and close modal when connecting from wallet', async () => {
  await modalPage.openModal()
  await walletPage.disconnectConnection()
  await modalValidator.expectModalNotVisible()
  await walletPage.page.waitForTimeout(500)
})

test('it should disconnect as expected', async () => {
  await modalPage.qrCodeFlow({
    page: modalPage,
    walletPage,
    qrCodeFlowType: 'immediate-connect'
  })
  await modalValidator.expectConnected()
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})
