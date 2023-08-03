import type { Locator, Page } from '@playwright/test'
import { LOCAL_LABS_URL } from '../constants'

export class ModalPage {
  private readonly baseURL = LOCAL_LABS_URL

  private readonly w3modal: Locator

  constructor(public readonly page: Page) {
    this.w3modal = this.page.getByTestId('partial-core-connect-button')
  }

  async load() {
    await this.page.goto(this.baseURL)
  }

  async getUri() {
    await this.page.goto(this.baseURL)
    await this.w3modal.click()
    await this.page
      .getByTestId('component-header-action-button')
      .filter({ hasText: 'WalletConnect' })
      .click()
    await this.page.getByTestId('copy-link-button').click()
  }

  async disconnect() {
    await this.page.getByTestId('view-account-disconnect-button').click()
  }
}
