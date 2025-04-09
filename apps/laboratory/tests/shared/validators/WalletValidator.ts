import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

import { getMaximumWaitConnections } from '../utils/timeouts'

const MAX_WAIT = getMaximumWaitConnections()

export class WalletValidator {
  private gotoSessions: Locator
  public page: Page

  constructor(page: Page) {
    this.page = page
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
    await this.expectSessionCard({ visible: true })
  }

  async expectSessionCard({ visible = true }: { visible?: boolean }) {
    if (visible) {
      await expect(
        this.page.getByTestId('session-card'),
        'Session card should be visible'
      ).toBeVisible({
        timeout: MAX_WAIT
      })
    } else {
      await expect(
        this.page.getByTestId('session-card'),
        'Session card should not be visible'
      ).not.toBeVisible({
        timeout: MAX_WAIT
      })
    }
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

  async expectReceivedSign({ chainName = 'Ethereum', expectNetworkName = true }) {
    await expect(
      this.page.getByTestId('session-approve-button'),
      'Session approve button should be visible'
    ).toBeVisible({
      timeout: MAX_WAIT
    })
    if (expectNetworkName) {
      await expect(
        this.page.getByTestId('request-details-chain'),
        'Request details should contain chain name'
      ).toContainText(chainName)
    }
  }

  async expectReceivedSignMessage({ message = 'Hello, World!' }) {
    await expect(
      this.page.getByTestId('session-approve-button'),
      'Session approve button should be visible'
    ).toBeVisible({ timeout: MAX_WAIT })
    await expect(
      this.page.getByText(message),
      'Request details should contain sign message'
    ).toBeVisible({ timeout: MAX_WAIT })
  }
}
