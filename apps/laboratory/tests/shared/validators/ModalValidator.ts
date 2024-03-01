import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ConstantsUtil } from '../../../src/utils/ConstantsUtil'
import { getMaximumWaitConnections } from '../utils/timeouts'

const MAX_WAIT = getMaximumWaitConnections()

export class ModalValidator {
  constructor(public readonly page: Page) {}

  async expectConnected() {
    const accountButton = this.page.locator('w3m-account-button')
    await expect(accountButton, 'Account button should be present').toBeAttached({
      timeout: MAX_WAIT
    })
  }

  async expectAuthenticated() {
    await expect(
      this.page.getByTestId('w3m-authentication-status'),
      'Authentication status should be: authenticated'
    ).toContainText('authenticated')
  }

  async expectUnauthenticated() {
    await expect(
      this.page.getByTestId('w3m-authentication-status'),
      'Authentication status should be: unauthenticated'
    ).toContainText('unauthenticated')
  }

  async expectSignatureDeclined() {
    await expect(
      this.page.getByText('Signature declined'),
      'Signature declined should be visible'
    ).toBeVisible()
  }

  async expectDisconnected() {
    await expect(
      this.page.getByTestId('account-button'),
      'Account button should not be present'
    ).not.toBeVisible({
      timeout: MAX_WAIT
    })
  }

  async expectNetwork(network: string) {
    const networkButton = this.page.locator('wui-network-button')
    await expect(networkButton, `Network button should contain text ${network}`).toHaveText(
      network,
      {
        timeout: 5000
      }
    )
  }

  async expectAcceptedSign() {
    // We use Chakra Toast and it's not quite straightforward to set the `data-testid` attribute on the toast element.
    await expect(this.page.getByText(ConstantsUtil.SigningSucceededToastTitle)).toBeVisible({
      timeout: 30 * 1000
    })
  }

  async expectRejectedSign() {
    // We use Chakra Toast and it's not quite straightforward to set the `data-testid` attribute on the toast element.
    await expect(this.page.getByText(ConstantsUtil.SigningFailedToastTitle)).toBeVisible()
  }
}
