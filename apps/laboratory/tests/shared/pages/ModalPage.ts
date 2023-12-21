import type { Locator, Page } from '@playwright/test'
import { LOCAL_LABS_URL } from '../constants'

export class ModalPage {
  private readonly baseURL = LOCAL_LABS_URL

  private readonly connectButton: Locator

  constructor(public readonly page: Page) {
    this.connectButton = this.page.getByText('Connect Wallet')
  }

  async load() {
    await this.page.goto(this.baseURL)
  }

  async copyConnectUriToClipboard() {
    await this.page.goto(this.baseURL)
    await this.connectButton.click()
    await this.page.getByText('WalletConnect').click()
    await this.page.waitForTimeout(2000)
    await this.page.getByText('Copy link').click()
  }
}
