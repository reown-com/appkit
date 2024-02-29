import { expect, type Page } from '@playwright/test'

const LOGIN_APPROVED_SUCCESS_TEXT = 'Login Approved'

export class DeviceRegistrationPage {
  constructor(
    public readonly page: Page,
    public readonly url: string
  ) {}

  async load() {
    await this.page.goto(this.url)
    await this.page.waitForLoadState()
  }

  async approveDevice() {
    await this.page.getByRole('button', { name: 'Approve' }).click()
    await expect(this.page.getByText(LOGIN_APPROVED_SUCCESS_TEXT)).toBeVisible()
  }
  async close() {
    await this.page.close()
  }
}
