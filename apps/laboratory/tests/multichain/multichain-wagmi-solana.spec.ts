import { type BrowserContext, test } from '@playwright/test'

import { DEFAULT_CHAIN_NAME } from '../shared/constants'
import { ModalPage } from '../shared/pages/ModalPage'
import { WalletPage } from '../shared/pages/WalletPage'
import { ModalValidator } from '../shared/validators/ModalValidator'
import { WalletValidator } from '../shared/validators/WalletValidator'

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
  walletValidator = new WalletValidator(walletPage.page)

  await modalPage.load()
  await modalPage.qrCodeFlow(modalPage, walletPage)
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
    await modalPage.switchNetwork(chainName)
    await modalPage.closeModal()

    // -- Sign ------------------------------------------------------------------
    await modalPage.sign(namespace)
    await walletValidator.expectReceivedSign({ chainName })
    await walletPage.handleRequest({ accept: true })
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
  await modalPage.openAccount()
  await modalPage.openProfileView()
  await modalPage.switchAccount()
  await modalValidator.expectAccountSwitched(originalAddress)
})

test('it should disconnect and close modal when connecting from wallet', async () => {
  await modalPage.openModal()
  await walletPage.disconnectConnection()
  await walletValidator.expectSessionCard({ visible: false })
  await modalValidator.expectModalNotVisible()
  await walletPage.page.waitForTimeout(500)
})

test('it should disconnect as expected', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})

test('it should also connect wagmi and sign a message if connecting from a different namespace', async () => {
  await modalPage.switchNetworkWithNetworkButton('Solana')
  await modalValidator.expectSwitchedNetworkOnNetworksView('Solana')
  await modalPage.closeModal()
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()

  await modalPage.sign('eip155')
  await walletValidator.expectReceivedSign({ chainName: 'Ethereum' })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()

  await modalPage.sign('solana')
  await walletValidator.expectReceivedSign({ chainName: 'Solana' })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()
})
