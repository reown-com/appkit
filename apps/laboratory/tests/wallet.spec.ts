import { type BrowserContext, test } from '@playwright/test'

import type { CaipNetworkId } from '@reown/appkit'
import {
  DEFAULT_CHAIN_NAME,
  WalletPage,
  WalletValidator,
  getBalanceSymbolByLibrary,
  getLastNetworkNameByLibrary,
  getNetworksByLibrary
} from '@reown/appkit-testing'

import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

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
  await modalValidator.expectBalanceFetched(getBalanceSymbolByLibrary(library))
})

sampleWalletTest('it should show onramp button accordingly', async ({ library }) => {
  await modalPage.openModal()
  if (library === 'bitcoin') {
    await modalValidator.expectOnrampButton(false)
  } else {
    await modalValidator.expectOnrampButton(true)
  }
  await modalPage.closeModal()
})

sampleWalletTest('it should be connected instantly after page refresh', async () => {
  await modalPage.page.reload()
  await modalValidator.expectToBeConnectedInstantly()
})

sampleWalletTest('it should show disabled networks', async ({ library }) => {
  if (library === 'bitcoin') {
    return
  }

  const disabledNetworks = library === 'solana' ? 'Solana Unsupported' : 'Gnosis'

  await modalPage.openModal()
  await modalPage.openNetworks()
  await modalValidator.expectNetworksDisabled(disabledNetworks)
  await modalPage.closeModal()
})

sampleWalletTest('it should switch networks and sign', async ({ library, browser }) => {
  const isFirefox = browser.browserType().name() === 'firefox'

  const networks = getNetworksByLibrary(library)
  const chains = networks.map(network => network.name)
  const caipNetworkIds = networks.map(network => network.id)

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
      caipNetworkIds[index] as CaipNetworkId
    )

    if (!isFirefox) {
      /**
       * On Bitcoin implementation, the account addresses are different per network, we need to implement this to AppKit as expected first.
       * Since when switching to Bitcoin Testnet, the account address on the wallet page is still Bitcoin address, then the sign message will fail.
       */
      if (library === 'bitcoin' && chainNameOnWalletPage !== 'Bitcoin') {
        return
      }
      /**
       * Bitcoin sign message has an issue on the sample wallet where sample wallet freezing after clicking approve button.
       * This is happening due to ecpair package that sample wallet is using while signing Bitcoin messages, and only happening with Firefox browser.
       */
      await modalPage.sign()
      await walletValidator.expectReceivedSign({
        chainName: chainNameOnWalletPage,
        expectNetworkName: library !== 'bitcoin'
      })
      await walletPage.handleRequest({ accept: true })
      await modalValidator.expectAcceptedSign()
    }

    await processChain(index + 1)
  }

  // Start processing from the first chain
  await processChain(0)
})

sampleWalletTest('it should switch networks using hook', async ({ library }) => {
  const networks = getNetworksByLibrary(library)
  const chains = networks.map(network => network.name)
  const caipNetworkIds = networks.map(network => network.id)

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
      caipNetworkIds[index] as CaipNetworkId
    )

    await processChain(index + 1)
  }

  // Start processing from the first chain
  await processChain(0)
})

sampleWalletTest('it should show last connected network after refreshing', async ({ library }) => {
  const chainName = getLastNetworkNameByLibrary(library)

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
  const chainName = getLastNetworkNameByLibrary(library)

  await modalPage.sign()
  await walletValidator.expectReceivedSign({ chainName, expectNetworkName: library !== 'bitcoin' })
  await walletPage.handleRequest({ accept: false })
  await modalValidator.expectRejectedSign()
})

sampleWalletTest('it should switch between multiple accounts', async ({ library }) => {
  // Multi address not available in Solana wallet
  if (library === 'solana' || library === 'bitcoin') {
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
  if (library === 'solana' || library === 'bitcoin') {
    return
  }

  await modalPage.openAccount()
  await modalPage.openProfileView()
  await modalValidator.expectMultipleAccounts()
  await modalPage.closeModal()
})

sampleWalletTest('it should disconnect and connect to a single account', async ({ library }) => {
  if (library === 'solana' || library === 'bitcoin') {
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
    if (library === 'solana' || library === 'bitcoin') {
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

sampleWalletTest(
  "it should switch to first available network when wallet doesn't support the active network of the appkit and sign message",
  async ({ library }) => {
    if (library === 'solana' || library === 'bitcoin') {
      return
    }

    await walletPage.disconnectConnection()
    await modalValidator.expectDisconnected()

    await modalPage.switchNetworkWithNetworkButton('Aurora')
    await modalValidator.expectSwitchChainWithNetworkButton('Aurora')
    await modalPage.closeModal()

    await modalPage.qrCodeFlow(modalPage, walletPage)
    await modalValidator.expectConnected()
    await modalPage.openModal()
    await modalPage.openNetworks()
    await modalValidator.expectSwitchedNetwork('Ethereum')
    await modalPage.closeModal()
    await modalPage.sign()
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
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
  if (library === 'bitcoin') {
    return
  }

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
