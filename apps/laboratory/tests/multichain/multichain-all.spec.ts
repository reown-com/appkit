import { type Page, expect } from '@playwright/test'

import { WalletPage, WalletValidator } from '@reown/appkit-testing'
import { DEFAULT_SESSION_PARAMS } from '@reown/appkit-testing'

import { extensionFixture } from '../shared/fixtures/extension-fixture'
import { ModalPage } from '../shared/pages/ModalPage'
import { ModalValidator } from '../shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let page: Page
let modalPage: ModalPage
let modalValidator: ModalValidator
let walletPage: WalletPage
let walletValidator: WalletValidator
let walletConnectEvmAddress: string
let walletConnectSolanaAddress: string
let solanaExtensionWalletAddress: string
/* eslint-enable init-declarations */

const WALLET_CONNECT_TEST_ID = 'walletConnect'
const NAMESPACE = 'eip155'

// -- Setup --------------------------------------------------------------------
const test = extensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ context }) => {
  page = await context.newPage()

  modalPage = new ModalPage(page, 'multichain-all', 'default')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(page)
  walletValidator = new WalletValidator(walletPage.page)

  await modalPage.load()
  await modalPage.qrCodeFlow(modalPage, walletPage)
})

test.afterAll(async () => {
  await page.close()
})

// -- Tests --------------------------------------------------------------------
test('should connect to all namespaces', async () => {
  await modalValidator.expectAccountButtonReady('eip155')
  await modalValidator.expectAccountButtonReady('solana')
  await modalValidator.expectAccountButtonReady('bip122')
})

test('should sign message for each chain', async ({ browser }) => {
  const isFirefox = browser.browserType().name() === 'firefox'

  await modalPage.sign('eip155')
  await walletValidator.expectReceivedSign({ chainName: 'Ethereum' })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()

  await modalPage.sign('solana')
  await walletValidator.expectReceivedSign({ chainName: 'Solana' })
  await walletPage.handleRequest({ accept: true })
  await modalValidator.expectAcceptedSign()

  if (!isFirefox) {
    /**
     * Bitcoin sign message has an issue on the sample wallet where sample wallet freezing after clicking approve button.
     * This is happening due to ecpair package that sample wallet is using while signing Bitcoin messages, and only happening with Firefox browser.
     */
    await modalPage.sign('bip122')
    await walletValidator.expectReceivedSignMessage({ message: 'Hello, World!' })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
  }
})

test('should refresh page and expect reconnected', async () => {
  await modalPage.page.reload()
  await modalValidator.expectAccountButtonReady('eip155')
  await modalValidator.expectAccountButtonReady('solana')
  await modalValidator.expectAccountButtonReady('bip122')
})

test('should switch network as expected', async () => {
  await modalPage.switchNetwork('Polygon')
  await modalValidator.expectSwitchedNetwork('Polygon')
  await modalPage.closeModal()

  await modalPage.switchNetwork('Solana')
  await modalValidator.expectSwitchedNetwork('Solana')
  await modalPage.closeModal()

  await modalPage.switchNetwork('Bitcoin')
  await modalValidator.expectSwitchedNetwork('Bitcoin')
  await modalPage.closeModal()
})

test('should switch network when clicking on the account buttons', async () => {
  await modalPage.openAccount('eip155')
  await modalValidator.expectSwitchChainWithNetworkButton('Polygon')
  await modalPage.closeModal()

  await modalPage.openAccount('solana')
  await modalValidator.expectSwitchChainWithNetworkButton('Solana')
  await modalPage.closeModal()

  await modalPage.openAccount('bip122')
  await modalValidator.expectSwitchChainWithNetworkButton('Bitcoin')
  await modalPage.closeModal()
})

test('should switch network when clicking custom buttons per namespace', async () => {
  const evmButton = modalPage.page.locator('[data-testid="evm-connect-button"]')
  const solanaButton = modalPage.page.locator('[data-testid="solana-connect-button"]')
  const bitcoinButton = modalPage.page.locator('[data-testid="bitcoin-connect-button"]')

  await evmButton.click()
  await modalValidator.expectAccountButtonReady('eip155')
  await modalPage.closeModal()
  await modalValidator.expectBalanceFetched('POL', 'eip155')

  await solanaButton.click()
  await modalValidator.expectAccountButtonReady('solana')
  await modalPage.closeModal()
  await modalValidator.expectBalanceFetched('SOL', 'solana')

  await bitcoinButton.click()
  await modalValidator.expectAccountButtonReady('bip122')
  await modalPage.closeModal()
  await modalValidator.expectBalanceFetched('BTC', 'bip122')
})

test('should disconnect from all namespaces', async () => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected('eip155')
  await modalValidator.expectDisconnected('solana')
  await modalValidator.expectDisconnected('bip122')
})

test('should disconnect from all namespaces when try to disconnect only one when connected with wc', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage)

  await modalValidator.expectAccountButtonReady('eip155')
  await modalValidator.expectAccountButtonReady('solana')
  await modalValidator.expectAccountButtonReady('bip122')

  await modalPage.disconnectWithHook('eip155')

  await modalValidator.expectDisconnected('eip155')
  await modalValidator.expectDisconnected('solana')
  await modalValidator.expectDisconnected('bip122')
})

test('it should connect to all namespaces with wallet buttons', async () => {
  await modalValidator.expectWalletButtonHook(`${WALLET_CONNECT_TEST_ID}-${NAMESPACE}`, false)
  await modalPage.clickWalletButton(`${WALLET_CONNECT_TEST_ID}-${NAMESPACE}`)
  const uri = await modalPage.getConnectUriFromQRModal()
  await walletPage.connectWithUri(uri)
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)

  // It should be connected to all namespaces
  await modalValidator.expectAccountButtonReady('eip155')
  await modalValidator.expectAccountButtonReady('solana')
  await modalValidator.expectAccountButtonReady('bip122')

  await modalPage.disconnect()
  await modalValidator.expectDisconnected('eip155')
  await modalValidator.expectDisconnected('solana')
  await modalValidator.expectDisconnected('bip122')
})

test('should disconnect the previous connector when connecting to a new one', async () => {
  await modalPage.openConnectModal('solana')
  const solanaExtensionWallet = await modalPage.getExtensionWallet()
  await solanaExtensionWallet.click()
  await modalValidator.expectConnected('solana')
  solanaExtensionWalletAddress = await modalPage.getAddress('solana')

  await modalPage.openConnectModal('eip155')
  await modalPage.qrCodeFlow(modalPage, walletPage, undefined, true)
  await modalValidator.expectConnected('eip155')
  await modalValidator.expectConnected('solana')

  walletConnectSolanaAddress = await modalPage.getAddress('solana')
  walletConnectEvmAddress = await modalPage.getAddress('eip155')

  expect(await modalPage.getAddress('solana')).not.toBe(solanaExtensionWalletAddress)

  await modalPage.openAccount()
  await modalPage.clickWalletSwitchButton()
  await modalPage.clickTab('solana')

  await modalValidator.expectConnectionNotExist('Reown')
  await modalPage.closeModal()

  await modalPage.page.reload()

  await modalValidator.expectConnected('eip155')
  await modalValidator.expectConnected('solana')

  expect(await modalPage.getAddress('solana')).toBe(walletConnectSolanaAddress)
  expect(await modalPage.getAddress('eip155')).toBe(walletConnectEvmAddress)

  await modalPage.disconnect()
  await modalValidator.expectDisconnected('eip155')
  await modalValidator.expectDisconnected('solana')

  await modalPage.page.reload()

  await modalValidator.expectDisconnected('solana')
  await modalValidator.expectDisconnected('eip155')
})
