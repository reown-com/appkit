import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { LOCAL_LAB_URL } from '../constants'

export class ModalValidator {
  private readonly baseURL = LOCAL_LAB_URL

  constructor(public readonly page: Page) {}

  async isConnected() {
    if (this.page.url() !== this.baseURL) {
      await this.page.goto(this.baseURL)
    }
    await expect(this.page.getByTestId('partial-account-address')).toBeVisible()
  }

  async isDisconnected() {
    if (this.page.url() !== this.baseURL) {
      await this.page.goto(this.baseURL)
    }
    await expect(this.page.getByTestId('partial-account-address')).not.toBeVisible()
  }

  async acceptedSign() {
    await expect(this.page.getByText('Sign Message')).toBeVisible()
    await expect(this.page.getByText('0x')).toBeVisible()
  }

  async rejectedSign() {
    await expect(this.page.getByText('Sign Message')).toBeVisible()
    await expect(this.page.getByText(/User rejected/u)).toBeVisible()
  }

  async acceptedSignTyped() {
    await expect(this.page.getByText('Sign Typed Data')).toBeVisible()
    await expect(this.page.getByText('0x')).toBeVisible()
  }

  async rejectedSignTyped() {
    await expect(this.page.getByText('Sign Typed Data')).toBeVisible()
    await expect(this.page.getByText(/User rejected/u)).toBeVisible()
  }
}
