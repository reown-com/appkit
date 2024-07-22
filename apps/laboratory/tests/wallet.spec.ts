import { DEFAULT_CHAIN_NAME } from './shared/constants'
import { testConnectedMW } from './shared/fixtures/w3m-wallet-fixture'
import { expectConnection } from './shared/utils/validation'

testConnectedMW.beforeEach(async ({ modalValidator, walletValidator }) => {
  await expectConnection(modalValidator, walletValidator)
})

testConnectedMW.afterEach(async ({ modalPage, modalValidator, walletValidator, browserName }) => {
  if (browserName === 'firefox') {
    return
  }
  await modalPage.disconnect()

  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testConnectedMW(
  'it should sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    const chainName = modalPage.library === 'solana' ? 'Solana' : DEFAULT_CHAIN_NAME
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
  }
)

testConnectedMW(
  'it should reject sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    const chainName = modalPage.library === 'solana' ? 'Solana' : DEFAULT_CHAIN_NAME
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName })
    await walletPage.handleRequest({ accept: false })
    await modalValidator.expectRejectedSign()
  }
)

testConnectedMW(
  'it should switch networks and sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    const chains = modalPage.library === 'solana' ? ['Solana Testnet'] : ['Polygon', 'Ethereum']

    // Run them one after another
    async function processChain(index: number) {
      if (index >= chains.length) {
        return
      }

      const chainName = chains[index] ?? DEFAULT_CHAIN_NAME
      // For Solana, even though we switch to Solana Devnet, the chain name on the wallet page is still Solana
      const chainNameOnWalletPage = modalPage.library === 'solana' ? 'Solana' : chainName
      await modalPage.switchNetwork(chainName)
      await modalValidator.expectSwitchedNetwork(chainName)
      await modalPage.closeModal()
      await modalPage.sign()
      await walletValidator.expectReceivedSign({ chainName: chainNameOnWalletPage })
      await walletPage.handleRequest({ accept: true })
      await modalValidator.expectAcceptedSign()

      await processChain(index + 1)
    }

    // Start processing from the first chain
    await processChain(0)
  }
)

testConnectedMW('it should show multiple accounts', async ({ modalPage, modalValidator }) => {
  // Multi address not available in solana wallet
  if (modalPage.library === 'solana') {
    return
  }
  await modalPage.openAccount()
  await modalPage.openProfileView()
  await modalValidator.expectMultipleAccounts()
  await modalPage.closeModal()
})

testConnectedMW(
  'it should show Switch Network modal if network is not supported',
  async ({ modalPage, modalValidator, walletPage }) => {
    if (modalPage.library === 'solana') {
      return
    }
    await walletPage.enableTestnets()
    await walletPage.switchNetwork('eip155:5')
    await modalValidator.expectNetworkNotSupportedVisible()
    await modalPage.closeModal()
  }
)
