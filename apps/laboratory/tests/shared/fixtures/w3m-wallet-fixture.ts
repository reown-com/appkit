/* eslint no-console: 0 */

import { testM as base, testMSiwe as siwe, testMultiChainM as multiChain } from './w3m-fixture'
import { WalletPage } from '../pages/WalletPage'
import { WalletValidator } from '../validators/WalletValidator'

import { DEFAULT_SESSION_PARAMS } from '../constants'
import { doActionAndWaitForNewPage } from '../utils/actions'
import { timeEnd, timeStart } from '../utils/logs'

// Declare the types of fixtures to use
interface ModalWalletFixture {
  walletPage: WalletPage
  walletValidator: WalletValidator
}

// MW -> test Modal + Wallet
export const testConnectedMW = base.extend<ModalWalletFixture>({
  walletPage: async ({ context, modalPage, timingRecords }, use) => {
    if (modalPage.library === 'solana') {
      // Because solana doesn't support react-wallet-v2
      timeStart('new WalletPage')
      const walletPage = new WalletPage(await context.newPage())
      timeEnd('new WalletPage')
      timeStart('walletPage.load')
      await walletPage.load()
      timeEnd('walletPage.load')
      timeStart('walletPage.connectWithUri')
      const walletValidator = new WalletValidator(walletPage.page)
      timeEnd('walletPage.connectWithUri')
      timeStart('modalPage.getConnectUri')
      const uri = await modalPage.getConnectUri(timingRecords)
      timeEnd('modalPage.getConnectUri')
      timeStart('walletPage.connectWithUri')
      await walletPage.connectWithUri(uri)
      timeEnd('walletPage.connectWithUri')
      const connectionInitiated = new Date()
      timeStart('walletPage.handleSessionProposal')
      await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
      timeEnd('walletPage.handleSessionProposal')
      const proposalReceived = new Date()
      timingRecords.push({
        item: 'receiveSessionProposal',
        timeMs: proposalReceived.getTime() - connectionInitiated.getTime()
      })
      timeStart('walletValidator.expectConnected')
      await walletValidator.expectConnected()
      timeEnd('walletValidator.expectConnected')
      await use(walletPage)
    } else {
      timeStart('doActionAndWaitForNewPage')
      const page = await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context)
      let pairingCreatedTime: Date | null = null
      let verificationStartedTime: Date | null = null
      page.on('console', msg => {
        if (msg.text().includes('set') && msg.text().includes('core/pairing/pairing')) {
          pairingCreatedTime = new Date()
        }
        if (msg.text().includes('resolving attestation')) {
          verificationStartedTime = new Date()
        }
        if (msg.text().includes('session_proposal') && msg.text().includes('verifyContext')) {
          // For some reason this log is emitted twice; so only recording the time once
          if (verificationStartedTime) {
            const verificationEndedTime = new Date()
            timingRecords.push({
              item: 'sessionProposalVerification',
              timeMs: verificationEndedTime.getTime() - verificationStartedTime.getTime()
            })
            verificationStartedTime = null
          }
        }
      })
      timeEnd('doActionAndWaitForNewPage')
      const connectionInitiated = new Date()
      timeStart('new WalletPage')
      const walletPage = new WalletPage(page)
      timeEnd('new WalletPage')
      timeStart('walletPage.handleSessionProposal')
      await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
      timeEnd('walletPage.handleSessionProposal')
      const proposalReceived = new Date()
      timingRecords.push({
        item: 'deeplinkReceiveSessionProposal',
        timeMs: proposalReceived.getTime() - connectionInitiated.getTime()
      })
      if (pairingCreatedTime) {
        timingRecords.push({
          item: 'pairingReceiveSessionProposal',
          timeMs: proposalReceived.getTime() - (pairingCreatedTime as Date).getTime()
        })
      }
      await use(walletPage)
    }
  },
  walletValidator: async ({ walletPage }, use) => {
    timeStart('new WalletValidator')
    const walletValidator = new WalletValidator(walletPage.page)
    timeEnd('new WalletValidator')
    await use(walletValidator)
  }
})

export const testMWSiwe = siwe.extend<ModalWalletFixture>({
  walletPage: async ({ context }, use) => {
    const walletPage = new WalletPage(await context.newPage())
    await walletPage.load()
    await use(walletPage)
  },
  walletValidator: async ({ walletPage }, use) => {
    const walletValidator = new WalletValidator(walletPage.page)
    await use(walletValidator)
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
