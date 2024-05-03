import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { getMaximumWaitConnections } from '../utils/timeouts'

const MAX_WAIT = getMaximumWaitConnections()

export class WalletValidator {
  private gotoSessions: Locator

  constructor(public page: Page) {
    this.gotoSessions = this.page.getByTestId('sessions')
  }

  loadNewPage(page: Page) {
    this.page = page
    this.gotoSessions = this.page.getByTestId('sessions')
  }

  async expectConnected() {
    await expect(
      this.gotoSessions,
      'Approve screen should be closed and sessions tab visible'
    ).toBeVisible()
    await this.gotoSessions.click()
    await this.expectSessionCard()
  }

  async expectSessionCard() {
    await expect(
      this.page.getByTestId('session-card'),
      'Session card should be visible'
    ).toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectDisconnected() {
    await this.gotoSessions.click()
    await expect(
      this.page.getByTestId('session-card'),
      'Session card should not be visible'
    ).not.toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectReceivedSign({ chainName = 'Ethereum' }) {
    await expect(
      this.page.getByTestId('session-approve-button'),
      'Session approve button should be visible'
    ).toBeVisible({
      timeout: MAX_WAIT
    })
    await expect(
      this.page.getByTestId('request-details-chain'),
      'Request details should contain chain name'
    ).toContainText(chainName)
  }
}
