import type { Page } from '@playwright/test'

export class DeviceRegistrationPage {
  constructor(
    public readonly page: Page,
    public readonly url: string
  ) {}

  async load() {
    await this.page.goto(this.url)
  }

  async approveDevice() {
    await this.page.getByRole('button', { name: 'Approve' }).click()
  }
}
