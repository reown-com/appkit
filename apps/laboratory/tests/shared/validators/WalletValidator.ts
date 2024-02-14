import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { getMaximumWaitConnections } from '../utils/timeouts'

const MAX_WAIT = getMaximumWaitConnections()

export class WalletValidator {
  private readonly gotoSessions: Locator

  constructor(public readonly page: Page) {
    this.gotoSessions = this.page.getByTestId('sessions')
  }

  async expectConnected() {
    await this.gotoSessions.click()
    await expect(this.page.getByTestId('session-card')).toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectDisconnected() {
    await this.gotoSessions.click()
    await expect(this.page.getByTestId('session-card')).not.toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectReceivedSign({ chainName = 'Ethereum' }) {
    await expect(this.page.getByTestId('session-approve-button')).toBeVisible({
      timeout: MAX_WAIT
    })
    await expect(this.page.getByTestId('request-details-chain')).toContainText(chainName)
  }
}
