import { DEFAULT_CHAIN_NAME, DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMWMultiChain } from './shared/fixtures/w3m-wallet-fixture'

import { expectConnection } from './shared/utils/validation'

testMWMultiChain.beforeEach(async ({ modalValidator, walletValidator }) => {
  await expectConnection(modalValidator, walletValidator)
})

testMWMultiChain.afterEach(async ({ modalPage, modalValidator }) => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})

testMWMultiChain(
  'it should connect to Ethereum and sign',
  async ({ modalPage, modalValidator, walletPage, walletValidator }) => {
    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName: DEFAULT_CHAIN_NAME })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
  }
)

testMWMultiChain.skip(
  'it should connect to Solana and sign',
  async ({ modalPage, modalValidator, walletPage, walletValidator }) => {
    // TODO(enes): Since we didn't replaced WC with UniversalAdapter yet, we need to disconnect from EVM first then reconnect with Solana's WC connector.
    await modalPage.disconnect()
    await modalPage.switchNetworkWithNetworkButton('Solana')
    await modalPage.closeModal()

    const uri = await modalPage.getConnectUri(undefined, false)
    await walletPage.connectWithUri(uri)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectConnected()

    await modalPage.sign()
    await walletValidator.expectReceivedSign({ chainName: 'Solana' })
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()
  }
)
