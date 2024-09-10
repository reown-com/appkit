import { test, type BrowserContext } from '@playwright/test'
import { DEFAULT_CHAIN_NAME } from './shared/constants'
import { WalletPage } from './shared/pages/WalletPage'
import { WalletValidator } from './shared/validators/WalletValidator'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'
import { expect } from 'vitest'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let walletPage: WalletPage
let walletValidator: WalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const sampleWalletTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

sampleWalletTest.describe.configure({ mode: 'serial' })

sampleWalletTest.beforeAll(async ({ browser, library }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'default')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(browserPage)
  walletValidator = new WalletValidator(walletPage.page)

  await modalPage.load()
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
})

sampleWalletTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
sampleWalletTest('it should fetch balance as expected', async ({ library }) => {
  await modalValidator.expectBalanceFetched(library === 'solana' ? 'SOL' : 'ETH')
})

sampleWalletTest('it should show disabled networks', async ({ library }) => {
  const disabledNetworks = library === 'solana' ? 'Solana Unsupported' : 'Arbitrum'

  await modalPage.openModal()
  await modalPage.openNetworks()
  await modalValidator.expectNetworksDisabled(disabledNetworks)
  await modalPage.closeModal()
})

sampleWalletTest('it should switch networks and sign', async ({ library }) => {
  const chains = library === 'solana' ? ['Solana Testnet', 'Solana'] : ['Polygon', 'Ethereum']

  async function processChain(index: number) {
    if (index >= chains.length) {
      return
    }

    const chainName = chains[index] ?? DEFAULT_CHAIN_NAME
    // -- Switch network --------------------------------------------------------
    /* For Solana, even though we switch to Solana Devnet, the chain name on the wallet page is still Solana */
    const chainNameOnWalletPage = library === 'solana' ? 'Solana' : chainName
    await modalPage.switchNetwork(chainName)
    await modalValidator.expectSwitchedNetwork(chainName)
    await modalPage.closeModal()

    // -- Sign ------------------------------------------------------------------
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName: chainNameOnWalletPage })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    await processChain(index + 1)
  }

  // Start processing from the first chain
  await processChain(0)
})

sampleWalletTest('it should reject sign', async ({ library }) => {
  const chainName = library === 'solana' ? 'Solana' : DEFAULT_CHAIN_NAME
  await modalPage.sign()
  await walletValidator.expectReceivedSign({ chainName })
  await walletPage.handleRequest({ accept: false })
  await modalValidator.expectRejectedSign()
})

sampleWalletTest('it should switch between multiple accounts', async ({ library }) => {
  // Multi address not available in Solana wallet
  if (library === 'solana') {
    return
  }
  const originalAddress = await modalPage.getAddress()
  await modalPage.openAccount()
  await modalPage.openProfileView()
  await modalPage.switchAccount()
  await modalValidator.expectAccountSwitched(originalAddress)
})

sampleWalletTest('it should show multiple accounts', async ({ library }) => {
  // Multi address not available in Solana wallet
  if (library === 'solana') {
    return
  }

  await modalPage.openAccount()
  await modalPage.openProfileView()
  await modalValidator.expectMultipleAccounts()
  await modalPage.closeModal()
})

sampleWalletTest(
  'it should show switch network modal if network is not supported',
  async ({ library }) => {
    if (library === 'solana') {
      return
    }

    await walletPage.enableTestnets()
    await walletPage.switchNetwork('eip155:5')
    await modalValidator.expectNetworkNotSupportedVisible()
    await modalPage.closeModal()
  }
)

sampleWalletTest('it should not show onramp button accordingly', async ({ library }) => {
  await modalPage.openModal()
  await modalValidator.expectOnrampButton(library)
  await modalPage.closeModal()
})

sampleWalletTest('it should disconnect and close modal when connecting from wallet', async () => {
  await modalPage.openModal()
  await walletPage.disconnectConnection()
  await walletValidator.expectSessionCard({ visible: false })
  await modalValidator.expectModalNotVisible()
  await walletPage.page.waitForTimeout(500)
})

sampleWalletTest('it should disconnect as expected', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})
