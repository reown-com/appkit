/* eslint no-console: 0 */

import { testM as base } from './w3m-fixture'
import { WalletPage } from '../pages/WalletPage'
import { WalletValidator } from '../validators/WalletValidator'

import { DEFAULT_SESSION_PARAMS } from '../constants'
import { doActionAndWaitForNewPage } from '../utils/actions'

interface ModalWalletFixture {
  walletPage: WalletPage
  walletValidator: WalletValidator
}

export const appKitTestMW = base.extend<ModalWalletFixture>({
  walletPage: async ({ context, modalPage }, use) => {
    const page = await doActionAndWaitForNewPage(modalPage.clickWalletDeeplink(), context)
    const walletPage = new WalletPage(page)
    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await use(walletPage)
  },
  walletValidator: async ({ walletPage }, use) => {
    const walletValidator = new WalletValidator(walletPage.page)
    await use(walletValidator)
  }
})

export { expect } from '@playwright/test'
