import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { LOCAL_LABS_URL } from '../constants'

export class ModalValidator {
  private readonly baseURL = LOCAL_LABS_URL

  constructor(public readonly page: Page) {}

  async expectConnected() {
    await expect(this.page.getByTestId('partial-account-address')).toBeVisible()
  }

  async expectDisconnected() {
    await expect(this.page.getByTestId('partial-account-address')).not.toBeVisible()
  }

  async expectAcceptedSign() {
    await expect(this.page.getByTestId('notification-header')).toBeVisible()
    await expect(this.page.getByTestId('notification-header')).toHaveText('Sign Message')
    await expect(this.page.getByTestId('notification-body')).toBeVisible()
    await expect(this.page.getByTestId('notification-body')).toHaveText(/0x/u)
  }

  async expectRejectedSign() {
    await expect(this.page.getByTestId('notification-header')).toBeVisible()
    await expect(this.page.getByTestId('notification-header')).toHaveText('Sign Message')
    await expect(this.page.getByTestId('notification-body')).toBeVisible()
    await expect(this.page.getByTestId('notification-body')).toHaveText(/User rejected/u)
  }

  async expectAcceptedSignTyped() {
    await expect(this.page.getByTestId('notification-header')).toBeVisible()
    await expect(this.page.getByTestId('notification-header')).toHaveText('Sign Typed Data')
    await expect(this.page.getByTestId('notification-body')).toBeVisible()
    await expect(this.page.getByTestId('notification-body')).toHaveText(/0x/u)
  }

  async expectRejectedSignTyped() {
    await expect(this.page.getByTestId('notification-header')).toBeVisible()
    await expect(this.page.getByTestId('notification-header')).toHaveText('Sign Typed Data')
    await expect(this.page.getByTestId('notification-body')).toBeVisible()
    await expect(this.page.getByTestId('notification-body')).toHaveText(/User rejected/u)
  }
}
