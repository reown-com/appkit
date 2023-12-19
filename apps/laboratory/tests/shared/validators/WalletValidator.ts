import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export class WalletValidator {
  private readonly gotoSessions: Locator

  constructor(public readonly page: Page) {
    this.gotoSessions = this.page.getByTestId('sessions')
  }

  async expectConnected() {
    await this.page.reload()
    await this.gotoSessions.click()
    await expect(this.page.getByTestId('session-card')).toBeVisible()
  }
}
