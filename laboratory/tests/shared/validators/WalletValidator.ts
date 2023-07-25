import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { LOCAL_WALLET_URL } from '../constants'

export class WalletValidator {
  private readonly baseURL = LOCAL_WALLET_URL

  private readonly goToAccounts: Locator

  private readonly goToSessions: Locator

  private readonly goToHome: Locator

  private readonly goToPairings: Locator

  private readonly goToSettings: Locator

  constructor(public readonly page: Page) {
    this.goToAccounts = this.page.getByTestId('accounts')
    this.goToSessions = this.page.getByTestId('sessions')
    this.goToHome = this.page.getByTestId('wc-connect')
    this.goToPairings = this.page.getByTestId('pairings')
    this.goToSettings = this.page.getByTestId('settings')
  }

  async isConnected() {
    await this.page.reload()
    await this.goToSessions.click()
    await expect(this.page.getByTestId('session-card')).toBeVisible()
  }

  async isDisconnected() {
    await this.page.reload()
    await this.goToSessions.click()
    await expect(this.page.getByTestId('session-card')).not.toBeVisible()
  }

  async recievedSign({ chainName = 'Ethereum' }) {
    await expect(this.page.getByText('Sign Message')).toBeVisible()
    await expect(this.page.getByTestId('request-details-chain')).toHaveText(chainName)
  }

  async recievedSignTyped({ chainName = 'Ethereum' }) {
    await expect(this.page.getByText('Sign Typed Data')).toBeVisible()
    await expect(this.page.getByTestId('request-details-chain')).toHaveText(chainName)
  }
}
