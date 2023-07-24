import type { Page } from '@playwright/test'

export class WalletPage {
  baseURL = 'http://localhost:3001'

  constructor(public readonly page: Page) {}

  async load() {
    await this.page.goto(this.baseURL)
  }

  async connect() {
    await this.page.getByTestId('wc-connect').click()
  }
}
