import { type Page, expect } from '@playwright/test'

const LOGIN_APPROVED_SUCCESS_TEXT = 'approved'

export class DeviceRegistrationPage {
  public readonly page: Page
  public readonly url: string
  constructor(page: Page, url: string) {
    this.page = page
    this.url = url
  }

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
