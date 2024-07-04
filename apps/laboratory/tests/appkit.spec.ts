import { DEFAULT_CHAIN_NAME, DEFAULT_SESSION_PARAMS } from './shared/constants'
import { appKitTestMW } from './shared/fixtures/appkit-wallet-fixture'
import { doActionAndWaitForNewPage } from './shared/utils/actions'
import { expectConnection } from './shared/utils/validation'

appKitTestMW.beforeEach(async ({ modalValidator, walletValidator }) => {
  await expectConnection(modalValidator, walletValidator)
})

appKitTestMW.afterEach(async ({ modalPage, modalValidator, walletValidator, browserName }) => {
  if (browserName === 'firefox') {
    return
  }
  await modalPage.disconnect()

  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

appKitTestMW(
  'it should sign on both evm and solana',
  async ({ context, modalPage, walletPage, modalValidator, walletValidator }) => {
    await modalPage.sign()
    await walletValidator.expectReceivedSign({})
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
    // Switch to Solana and connect again
    await modalPage.switchNetwork('Solana')
    await modalValidator.expectConnectScreen()
    await modalPage.closeModal()

    await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  }
)

// appKitTestMW(
//   'it should reject sign',
//   async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
//     const chainName = modalPage.library === 'solana' ? 'Solana' : DEFAULT_CHAIN_NAME
//     await modalPage.sign()
//     await walletValidator.expectReceivedSign({ chainName })
//     await walletPage.handleRequest({ accept: false })
//     await modalValidator.expectRejectedSign()
//   }
// )

// appKitTestMW(
//   'it should switch networks and sign',
//   async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
//     const chains = modalPage.library === 'solana' ? ['Solana Testnet'] : ['Polygon', 'Ethereum']

//     // Run them one after another
//     async function processChain(index: number) {
//       if (index >= chains.length) {
//         return
//       }

//       const chainName = chains[index] ?? DEFAULT_CHAIN_NAME
//       // For Solana, even though we switch to Solana Devnet, the chain name on the wallet page is still Solana
//       const chainNameOnWalletPage = modalPage.library === 'solana' ? 'Solana' : chainName
//       await modalPage.switchNetwork(chainName)
//       await modalValidator.expectSwitchedNetwork(chainName)
//       await modalPage.closeModal()
//       await modalPage.sign()
//       await walletValidator.expectReceivedSign({ chainName: chainNameOnWalletPage })
//       await walletPage.handleRequest({ accept: true })
//       await modalValidator.expectAcceptedSign()

//       await processChain(index + 1)
//     }

//     // Start processing from the first chain
//     await processChain(0)
//   }
// )
