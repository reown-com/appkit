import { WalletPage, WalletValidator } from '@reown/appkit-testing'
import { DEFAULT_SESSION_PARAMS } from '@reown/appkit-testing'

import { timeEnd, timeStart } from '../utils/logs'
import { testM as base, testMultiChainM as multiChain, testMSiwe as siwe } from './w3m-fixture'

// Declare the types of fixtures to use
interface ModalWalletFixture {
  walletPage: WalletPage
  walletValidator: WalletValidator
}

// MW -> test Modal + Wallet
export const testConnectedMW = base.extend<ModalWalletFixture>({
  walletPage: async ({ context, modalPage, timingRecords }, use) => {
    timeStart('new WalletPage')
    const walletPage = new WalletPage(await context.newPage())
    timeEnd('new WalletPage')

    timeStart('walletPage.load')
    await walletPage.load()
    timeEnd('walletPage.load')

    // Initiate connection
    timeStart('modalPage.getConnectUri')
    const uri = await modalPage.getConnectUri(timingRecords)
    timeEnd('modalPage.getConnectUri')

    timeStart('walletPage.connectWithUri')
    await walletPage.connectWithUri(uri)
    // Capture immediately on resolution — nothing awaited in between — to avoid skewing the interval.
    const connectionInitiated = new Date()
    timeEnd('walletPage.connectWithUri')

    /*
     * The session proposal is received once the wallet renders the request UI (approve button).
     * Deterministic, owned-testid signal instead of parsing SDK console logs. Also guards delivery
     * failures: a proposal that never arrives times out here and fails the run (pages via the
     * success/failure canary). Interval includes the wallet's render time.
     */
    timeStart('walletPage.waitForSessionProposal')
    await walletPage.waitForSessionProposal()
    const proposalReceived = new Date()
    timeEnd('walletPage.waitForSessionProposal')

    timingRecords.push({
      item: 'sessionProposalReceived',
      timeMs: proposalReceived.getTime() - connectionInitiated.getTime()
    })

    // Approve the session proposal (request UI already visible from the wait above)
    timeStart('walletPage.handleSessionProposal')
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    const proposalApproved = new Date()
    timeEnd('walletPage.handleSessionProposal')

    timingRecords.push({
      item: 'sessionProposalApproved',
      timeMs: proposalApproved.getTime() - proposalReceived.getTime()
    })

    const walletValidator = new WalletValidator(walletPage.page)

    timeStart('walletValidator.expectConnected')
    await walletValidator.expectConnected()
    timeEnd('walletValidator.expectConnected')

    await use(walletPage)
  }
})

export const testMWSiwe = siwe.extend<ModalWalletFixture>({
  walletPage: async ({ context }, use) => {
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    await use(walletPage)
  }
})

export const testMWMultiChain = multiChain.extend<ModalWalletFixture>({
  walletPage: async ({ context, modalPage, modalValidator }, use) => {
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    const uri = await modalPage.getConnectUri()
    await walletPage.connectWithUri(uri)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.expectConnected()
    await use(walletPage)
  },
  walletValidator: async ({ walletPage }, use) => {
    const walletValidator = new WalletValidator(walletPage.page)
    await use(walletValidator)
  }
})

export { expect } from '@playwright/test'
