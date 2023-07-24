import type { Locator, Page } from '@playwright/test'

export class ModalPage {
  private readonly baseURL = 'http://localhost:3000/with-wagmi/react'

  private readonly w3modal: Locator

  constructor(public readonly page: Page) {
    this.w3modal = this.page.getByTestId('partial-core-connect-button')
  }

  async load() {
    await this.page.goto(this.baseURL)
  }

  async getUri() {
    await this.page.goto(this.baseURL)
    await this.w3modal.click()
    await this.page.getByTestId('component-header-action-button').click()
  }
}
