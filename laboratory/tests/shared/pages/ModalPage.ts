import type { Page } from '@playwright/test'

export class ModalPage {
  baseURL = 'http://localhost:3000/with-wagmi/react'

  constructor(public readonly page: Page) {}

  async load() {
    await this.page.goto(this.baseURL)
  }

  async getUri() {
    await this.page.goto('/')
    await this.page.getByTestId('partial-core-connect-button').click()
    await this.page.getByTestId('component-header-action-button').click()
  }
}
