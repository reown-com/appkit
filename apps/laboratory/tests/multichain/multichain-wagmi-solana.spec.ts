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

  modalPage = new ModalPage(browserPage, 'multichain-wagmi-solana', 'default')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(browserPage)
  walletValidator = new WalletValidator(walletPage)

  await modalPage.load()
  await modalPage.qrCodeFlow({
    page: modalPage,
    walletPage
  })
  await modalValidator.expectConnected()
})

test.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
test('it should fetch balance as expected', async () => {
  await modalValidator.expectBalanceFetched('ETH')
})

test('it should show disabled networks', async () => {
  const disabledNetworks = 'Gnosis'

  await modalPage.openModal()
  await modalPage.openNetworks()
  await modalValidator.expectNetworksDisabled(disabledNetworks)
  await modalPage.closeModal()
})

test('it should switch networks and sign', async () => {
  const chains = ['Polygon', 'Solana']

  async function processChain(index: number) {
    if (index >= chains.length) {
      return
    }

    const chainName = chains[index] ?? DEFAULT_CHAIN_NAME
    const namespace = chainName === 'Solana' ? 'solana' : 'eip155'
    const network = chainName === 'Solana' ? `solana:${solana.id}` : `eip155:${polygon.id}`
    await modalPage.switchNetwork(chainName)
    await modalPage.closeModal()

    // -- Sign ------------------------------------------------------------------
    await modalPage.sign(namespace)
    await walletValidator.expectReceivedSign({ network })
    await modalValidator.expectAcceptedSign()

    await processChain(index + 1)
  }

  // Start processing from the first chain
  await processChain(0)
})

test('it should switch between multiple accounts', async () => {
  const chainName = 'Ethereum'
  await modalPage.switchNetwork(chainName)
  await modalPage.page.waitForTimeout(500)
  await modalPage.closeModal()
  const originalAddress = await modalPage.getAddress()
  await modalPage.openProfileWalletsView()
  await modalPage.switchAccount()
  await modalPage.closeModal()
  await modalValidator.expectAccountSwitched(originalAddress)
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
    walletPage
  })
  await modalValidator.expectConnected()
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})

test('it should also connect wagmi and sign a message if connecting from a different namespace', async () => {
  await modalPage.switchNetworkWithNetworkButton('Solana')
  await modalValidator.expectSwitchedNetworkOnNetworksView('Solana')
  await modalPage.closeModal()
  await modalPage.qrCodeFlow({
    page: modalPage,
    walletPage
  })
  await modalValidator.expectConnected()

  await modalPage.sign('eip155')
  await walletValidator.expectReceivedSign({ network: 'eip155:1' })
  await modalValidator.expectAcceptedSign()

  await modalPage.sign('solana')
  await walletValidator.expectReceivedSign({ network: `solana:${solana.id}` })
  await modalValidator.expectAcceptedSign()
})
