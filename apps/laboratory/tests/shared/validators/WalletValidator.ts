import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export class WalletValidator {
  private readonly gotoSessions: Locator
  private readonly vercelPreview: Locator

  constructor(public readonly page: Page) {
    this.gotoSessions = this.page.getByTestId('sessions')
    this.vercelPreview = this.page.locator('css=vercel-live-feedback')
  }

  async reload() {
    await this.page.reload()
    await this.page.getByTestId('wc-connect').isVisible()
    await this.page.waitForTimeout(1000)
    const isVercelPreview = await this.vercelPreview.count() > 0
    if (isVercelPreview) {
      await this.vercelPreview.evaluate((iframe: any) => iframe.remove())
    }
  }

  async expectConnected() {
    await this.reload()
    await this.gotoSessions.click()
    await expect(this.page.getByTestId('session-card')).toBeVisible()
  }

  async expectDisconnected() {
    await this.reload()
    await this.gotoSessions.click()
    await expect(this.page.getByTestId('session-card')).not.toBeVisible()
  }

  async expectReceivedSign({ chainName = 'Ethereum' }) {
    await expect(this.page.getByTestId('session-approve-button')).toBeVisible()
    await expect(this.page.getByTestId('request-details-chain')).toHaveText(chainName)
  }
}
