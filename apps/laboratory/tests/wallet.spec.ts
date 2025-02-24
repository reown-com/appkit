import { type BrowserContext, test } from '@playwright/test'

import type { CaipNetworkId } from '@reown/appkit'
import { mainnet, polygon, solana, solanaTestnet } from '@reown/appkit/networks'

import { DEFAULT_CHAIN_NAME } from './shared/constants'
import { ModalPage } from './shared/pages/ModalPage'
import { WalletPage } from './shared/pages/WalletPage'
import { ModalValidator } from './shared/validators/ModalValidator'
import { WalletValidator } from './shared/validators/WalletValidator'

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

sampleWalletTest('it should show onramp button accordingly', async () => {
  await modalPage.openModal()
  await modalValidator.expectOnrampButton()
  await modalPage.closeModal()
})

sampleWalletTest('it should be connected instantly after page refresh', async () => {
  await modalPage.page.reload()
  await modalValidator.expectToBeConnectedInstantly()
})

sampleWalletTest('it should show disabled networks', async ({ library }) => {
  const disabledNetworks = library === 'solana' ? 'Solana Unsupported' : 'Gnosis'

  await modalPage.openModal()
  await modalPage.openNetworks()
  await modalValidator.expectNetworksDisabled(disabledNetworks)
  await modalPage.closeModal()
})

sampleWalletTest('it should switch networks and sign', async ({ library }) => {
  const chains =
    library === 'solana' ? [solanaTestnet.name, solana.name] : [polygon.name, mainnet.name]
  const caipNetworkId =
    library === 'solana' ? [solanaTestnet.id, solana.id] : [polygon.id, mainnet.id]

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
    await modalValidator.expectCaipAddressHaveCorrectNetworkId(
      caipNetworkId[index] as CaipNetworkId
    )

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

sampleWalletTest('it should switch networks using hook', async ({ library }) => {
  const chains = library === 'solana' ? ['Solana Testnet', 'Solana'] : ['Polygon', 'Ethereum']
  const caipNetworkId =
    library === 'solana' ? [solanaTestnet.id, solana.id] : [polygon.id, mainnet.id]

  async function processChain(index: number) {
    if (index >= chains.length) {
      return
    }

    const chainName = chains[index] ?? DEFAULT_CHAIN_NAME
    // Switch network using hook button
    await modalPage.switchNetworkWithHook()
    await modalPage.openModal()
    await modalPage.openNetworks()
    await modalValidator.expectSwitchedNetwork(chainName)
    await modalPage.closeModal()
    await modalValidator.expectCaipAddressHaveCorrectNetworkId(
      caipNetworkId[index] as CaipNetworkId
    )

    await processChain(index + 1)
  }

  // Start processing from the first chain
  await processChain(0)
})

sampleWalletTest('it should show last connected network after refreshing', async ({ library }) => {
  const chainName = library === 'solana' ? 'Solana Testnet' : 'Polygon'

  await modalPage.switchNetwork(chainName)
  await modalValidator.expectSwitchedNetwork(chainName)
  await modalPage.closeModal()

  await modalPage.page.reload()

  await modalPage.openModal()
  await modalPage.openNetworks()
  await modalValidator.expectSwitchedNetwork(chainName)
  await modalPage.closeModal()
})

sampleWalletTest('it should reject sign', async ({ library }) => {
  const chainName = library === 'solana' ? 'Solana Testnet' : 'Polygon'

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

sampleWalletTest('it should disconnect and connect to a single account', async ({ library }) => {
  if (library === 'solana') {
    return
  }

  await walletPage.disconnectConnection()
  await modalValidator.expectDisconnected()
  walletPage.setConnectToSingleAccount(true)
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalPage.openAccount()
  await modalValidator.expectSingleAccount()
  walletPage.setConnectToSingleAccount(false)
  await modalPage.closeModal()
})

sampleWalletTest(
  'it should show switch network modal if network is not supported and switch to supported network',
  async ({ library }) => {
    if (library === 'solana') {
      return
    }

    await walletPage.disconnectConnection()
    await modalValidator.expectDisconnected()
    await modalPage.qrCodeFlow(modalPage, walletPage)
    await walletPage.enableTestnets()
    await walletPage.switchNetwork('eip155:5')
    await modalValidator.expectNetworkNotSupportedVisible()
    await walletPage.switchNetwork('eip155:1')
    await modalValidator.expectConnected()
    await modalPage.closeModal()
  }
)

sampleWalletTest('it should connect and disconnect using hook', async () => {
  await walletPage.disconnectConnection()
  await modalValidator.expectDisconnected()
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
  await modalPage.clickHookDisconnectButton()
  await modalValidator.expectDisconnected()
})

sampleWalletTest('it should disconnect and close modal when connecting from wallet', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
  await modalPage.openModal()
  await walletPage.disconnectConnection()
  await walletValidator.expectSessionCard({ visible: false })
  await modalValidator.expectModalNotVisible()
  await walletPage.page.waitForTimeout(500)
})

sampleWalletTest('it should display wallet guide and show explore option', async ({ library }) => {
  await modalPage.openConnectModal()
  await modalValidator.expectWalletGuide(library, 'get-started')
  await modalPage.clickWalletGuideGetStarted()
  await modalValidator.expectWalletGuide(library, 'explore')
  await modalPage.closeModal()
})

sampleWalletTest('it should disconnect as expected', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})
