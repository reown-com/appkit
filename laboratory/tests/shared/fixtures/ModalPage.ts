import type { Page } from '@playwright/test'

export class ModalPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:3000')
  }

  async getUri() {
    await this.page.goto('./with-wagmi/react')
    await this.page.getByTestId('partial-core-connect-button').click()
    await this.page.getByTestId('component-header-action-button').click()
  }
}
