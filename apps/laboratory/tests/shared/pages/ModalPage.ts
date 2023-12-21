import type { Locator, Page } from '@playwright/test'
import { BASE_URL } from '../constants'

export class ModalPage {
  private readonly baseURL = BASE_URL

  private readonly connectButton: Locator

  constructor(
    public readonly page: Page,
    public readonly library: string
  ) {
    this.connectButton = this.page.getByText('Connect Wallet')
  }

  async load() {
    await this.page.goto(`${this.baseURL}library/${this.library}/`)
  }

  async copyConnectUriToClipboard() {
    await this.page.goto(`${this.baseURL}library/${this.library}/`)
    await this.connectButton.click()
    await this.page.getByText('WalletConnect').click()
    await this.page.waitForTimeout(2000)
    await this.page.getByText('Copy link').click()
  }
}
