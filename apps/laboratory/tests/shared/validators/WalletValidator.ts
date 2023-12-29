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

  async expectDisconnected() {
    await expect.poll(async () => {
      await this.page.reload()
      await this.gotoSessions.click()
      return await this.page.getByTestId('session-card').isVisible()
    }, {
      message: 'All sessions should be disconnected',
      timeout: 15000,
    }).toBe(false)
  }

  async expectReceivedSign({ chainName = 'Ethereum' }) {
    await expect(this.page.getByTestId('session-approve-button')).toBeVisible()
    await expect(this.page.getByTestId('request-details-chain')).toHaveText(chainName)
  }
}
