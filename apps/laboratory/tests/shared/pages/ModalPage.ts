import type { Locator, Page } from '@playwright/test'
import { BASE_URL } from '../constants'

export class ModalPage {
  private readonly baseURL = BASE_URL

  private readonly connectButton: Locator

  constructor(
    public readonly page: Page,
    public readonly library: string
  ) {
    this.connectButton = this.page.getByTestId('connect-button')
  }

  async load() {
    await this.page.goto(`${this.baseURL}library/${this.library}/`)
  }

  async copyConnectUriToClipboard() {
    await this.page.goto(`${this.baseURL}library/${this.library}/`)
    await this.connectButton.click()
    await this.page.getByTestId('wallet-selector-walletconnect').click()
    await this.page.waitForTimeout(2000)
    await this.page.getByTestId('copy-wc2-uri').click()
  }

  async disconnect() {
    await this.page.getByTestId('account-button').click()
    await this.page.getByTestId('disconnect-button').click()
  }

  async sign() {
    await this.page.getByTestId('sign-message-button').click()
  }
}
