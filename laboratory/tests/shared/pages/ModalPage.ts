import type { Locator, Page } from '@playwright/test'
import { LOCAL_LABS_URL } from '../constants'

export class ModalPage {
  private readonly baseURL = LOCAL_LABS_URL

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

  async disconnect() {
    await this.page.getByTestId('partial-account-address').click()
    await this.page.getByTestId('view-account-disconnect-button').click()
  }

  async sign() {
    await this.page.getByTestId('lab-sign').click()
  }

  async signTyped() {
    await this.page.getByTestId('lab-sign-typed').click()
  }

  async switchChain({ chainName }: { chainName: string }) {
    await this.page.getByTestId('partial-network-switch-button').click()
    await this.page.getByText(new RegExp(chainName, 'u')).click()
  }

  async helpModal() {
    await this.page.getByTestId('backcard-help').click()
  }

  async closeModal() {
    await this.page.getByTestId('backcard-close').click()
  }

  async closePopup() {
    await this.page.locator('.nextui-modal-close-icon-svg').click()
  }
}
