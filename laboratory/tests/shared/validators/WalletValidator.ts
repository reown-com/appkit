import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { WALLET_URL } from '../constants'

export class WalletValidator {
  private readonly baseURL = WALLET_URL

  private readonly gotoAccounts: Locator

  private readonly gotoSessions: Locator

  private readonly gotoHome: Locator

  private readonly gotoPairings: Locator

  private readonly gotoSettings: Locator

  constructor(public readonly page: Page) {
    this.gotoAccounts = this.page.getByTestId('accounts')
    this.gotoSessions = this.page.getByTestId('sessions')
    this.gotoHome = this.page.getByTestId('wc-connect')
    this.gotoPairings = this.page.getByTestId('pairings')
    this.gotoSettings = this.page.getByTestId('settings')
  }

  async expectConnected() {
    await this.page.reload()
    await this.gotoSessions.click()
    await expect(this.page.getByTestId('session-card')).toBeVisible()
  }

  async expectDisconnected() {
    await this.page.reload()
    await this.gotoSessions.click()
    await expect(this.page.getByTestId('session-card')).not.toBeVisible()
  }

  async expectRecievedSign({ chainName = 'Ethereum' }) {
    await expect(this.page.getByText('Sign Message')).toBeVisible()
    await expect(this.page.getByTestId('request-details-chain')).toHaveText(chainName)
  }

  async expectRecievedSignTyped({ chainName = 'Ethereum' }) {
    await expect(this.page.getByText('Sign Typed Data')).toBeVisible()
    await expect(this.page.getByTestId('request-details-chain')).toHaveText(chainName)
  }
}
