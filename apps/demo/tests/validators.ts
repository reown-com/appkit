import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export const MAXIMUM_WAIT_CONNECTIONS = 30 * 1000

export function getMaximumWaitConnections(): number {
  if (process.env['CI']) {
    return MAXIMUM_WAIT_CONNECTIONS
  }

  return MAXIMUM_WAIT_CONNECTIONS * 2
}

const MAX_WAIT = getMaximumWaitConnections()

export class ModalValidator {
  public readonly page: Page
  constructor(page: Page) {
    this.page = page
  }

  expectSecureSiteFrameNotInjected() {
    const secureSiteIframe = this.page.frame({ name: 'w3m-secure-iframe' })
    expect(secureSiteIframe).toBeNull()
  }

  async expectConnected() {
    const connectView = this.page.locator('w3m-connect-view').first()
    const profileButton = this.page.locator('wui-profile-button').first()

    await expect(connectView, 'Connect view should be present').not.toBeVisible()
    await expect(profileButton, 'Profile button should be present').toBeVisible({
      timeout: MAX_WAIT
    })
    await this.page.waitForTimeout(500)
  }
}
