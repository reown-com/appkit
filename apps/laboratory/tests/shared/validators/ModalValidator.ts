import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { LOCAL_LABS_URL } from '../constants'

export class ModalValidator {
  private readonly baseURL = LOCAL_LABS_URL

  constructor(public readonly page: Page) {}

  async expectConnected() {
    if (this.page.url() !== this.baseURL) {
      await this.page.goto(this.baseURL)
    }
    await expect(this.page.getByTestId('partial-account-address')).toBeVisible()
  }

  async expectDisconnected() {
    if (this.page.url() !== this.baseURL) {
      await this.page.goto(this.baseURL)
    }
    await expect(this.page.getByTestId('partial-account-address')).not.toBeVisible()
  }
}
