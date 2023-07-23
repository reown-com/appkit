import type { Page } from '@playwright/test'

export class WalletPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:3001')
  }

  async connect() {
    await this.page.getByTestId('wc-connect').click()
  }
}
