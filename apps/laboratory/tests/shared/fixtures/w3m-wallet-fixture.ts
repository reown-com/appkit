/* eslint no-console: 0 */

import { testM as base, testMSiwe as siwe } from './w3m-fixture'
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
  walletPage: async ({ context, modalPage }, use) => {
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
      const uri = await modalPage.getConnectUri()
      timeEnd('modalPage.getConnectUri')
      timeStart('walletPage.connectWithUri')
      await walletPage.connectWithUri(uri)
      timeEnd('walletPage.connectWithUri')
      timeStart('walletPage.handleSessionProposal')
      await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
      timeEnd('walletPage.handleSessionProposal')
      timeStart('walletValidator.expectConnected')
      await walletValidator.expectConnected()
      timeEnd('walletValidator.expectConnected')
      await use(walletPage)
    } else {
      timeStart('doActionAndWaitForNewPage')
      const page = await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context)
      timeEnd('doActionAndWaitForNewPage')
      timeStart('new WalletPage')
      const walletPage = new WalletPage(page)
      timeEnd('new WalletPage')
      timeStart('walletPage.handleSessionProposal')
      await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
      timeEnd('walletPage.handleSessionProposal')
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

export { expect } from '@playwright/test'
