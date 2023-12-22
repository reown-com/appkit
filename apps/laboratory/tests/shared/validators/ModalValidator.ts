import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export class ModalValidator {
  constructor(public readonly page: Page) {}

  async expectConnected() {
    await expect(this.page.getByTestId('account-button')).toBeVisible()
  }

  async expectDisconnected() {
    await expect(this.page.getByTestId('account-button')).not.toBeVisible()
  }

  async expectAcceptedSign() {
    await expect(this.page.getByText('Success')).toBeVisible()
  }

  async expectRejectedSign() {
    await this.page.waitForTimeout(4000)
    await this.page.screenshot({ path: 'failure.png' })
    await expect(this.page.getByText('Error')).toBeVisible()
  }
}
