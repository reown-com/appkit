import { expect } from '@playwright/test'
import type { ModalPage } from '../pages/ModalPage'
import type { WalletPage } from '../pages/WalletPage'
import type { SessionParams } from '../types'
import { DEFAULT_SESSION_PARAMS } from '../constants'

export async function connect(
  modalPage: ModalPage,
  walletPage: WalletPage,
  opts: SessionParams = DEFAULT_SESSION_PARAMS
) {
  expect(modalPage).toBeDefined()
  expect(walletPage).toBeDefined()

  // Connect w2m to wallet
  await modalPage.getUri()
  await walletPage.connect()

  // UI validation methods would go here

  await walletPage.handleSessionProposal(opts)

  // UI validation methods would go here
}
