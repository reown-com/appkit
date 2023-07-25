import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Example of what a validator class could look like
 */
export class ModalValidator {
  constructor(public readonly page: Page) {}

  async expectModalToBeVisible() {
    await expect(this.page.getByTestId('partial-core-connect-button')).toBeVisible()
    await expect(this.page.getByTestId('component-header-action-button')).toBeVisible()
  }
}
