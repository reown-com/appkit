import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export class ModalValidator {
  constructor(public readonly page: Page) {}

  async expectConnected() {
    await expect(this.page.getByText('Sign Message')).toBeVisible()
  }
}
