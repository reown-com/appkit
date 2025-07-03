import { expect } from '@playwright/test'

import type { WalletPage } from '../pages/WalletPage.js'

export class WalletValidator {
  public walletPage: WalletPage

  constructor(walletPage: WalletPage) {
    this.walletPage = walletPage
  }

  async expectConnected() {
    const walletKit = this.walletPage.walletKitManager?.getWalletKit()

    if (!walletKit) {
      throw new Error('WalletKitManager not initialized')
    }

    await expect(() => {
      expect(Object.keys(walletKit.getActiveSessions()).length).toBeGreaterThan(0)
    }).toPass({ timeout: 10_000 })
  }

  async expectDisconnected() {
    const walletKit = this.walletPage.walletKitManager?.getWalletKit()

    if (!walletKit) {
      throw new Error('WalletKitManager not initialized')
    }

    await expect(() => {
      expect(Object.keys(walletKit.getActiveSessions()).length).toBe(0)
    }).toPass({ timeout: 10_000 })
  }

  async expectReceivedSign({ network = 'eip155:1' }) {
    await expect(() => {
      const lastSessionRequest = this.walletPage.lastSessionRequest

      expect(lastSessionRequest?.params.chainId).toBe(network)
    }).toPass({ timeout: 10_000 })
  }
}
