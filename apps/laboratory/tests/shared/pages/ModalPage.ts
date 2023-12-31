import type { Locator, Page } from '@playwright/test'
import { BASE_URL } from '../constants'

export type ModalFlavor = 'default' | 'siwe' | 'email'

export class ModalPage {
  private readonly baseURL = BASE_URL

  private readonly connectButton: Locator
  private readonly url: string

  constructor(
    public readonly page: Page,
    public readonly library: string,
    public readonly flavor: ModalFlavor
  ) {
    this.connectButton = this.page.getByTestId('connect-button')
    this.url =
      flavor !== 'default'
        ? `${this.baseURL}library/${this.library}-${this.flavor}/`
        : `${this.baseURL}library/${this.library}/`
  }

  async load() {
    await this.page.goto(this.url)
  }

  async copyConnectUriToClipboard() {
    await this.page.goto(this.url)
    await this.connectButton.click()
    await this.page.getByTestId('wallet-selector-walletconnect').click()
    await this.page.waitForTimeout(2000)
    await this.page.getByTestId('copy-wc2-uri').click()
  }

  async loginWithEmail(email: string) {
    await this.page.goto(this.url)
    await this.connectButton.click()
    await this.page.getByTestId('wui-email-input').locator('input').focus()
    await this.page.getByTestId('wui-email-input').locator('input').fill(email)
    await this.page.getByTestId('wui-email-input').locator('input').press('Enter')
  }

  async enterOTP(otp: string) {
    const splitted = otp.split('')
    for (let i = 0; i < splitted.length; i++) {
      await this.page.getByTestId('wui-otp-input').locator('input').nth(i).focus()
      await this.page.getByTestId('wui-otp-input').locator('input').nth(i).fill(splitted[i]!)
    }
  }

  async disconnect() {
    await this.page.getByTestId('account-button').click()
    await this.page.getByTestId('disconnect-button').click()
  }

  async sign() {
    await this.page.getByTestId('sign-message-button').click()
  }

  async appoveSign() {
    await this.page
      .frameLocator('#w3m-iframe')
      .getByRole('button', { name: 'Sign', exact: true })
      .click()
  }

  async promptSiwe() {
    await this.page.getByTestId('w3m-connecting-siwe-sign').click()
  }

  async cancelSiwe() {
    await this.page.getByTestId('w3m-connecting-siwe-cancel').click()
  }

  async switchNetwork(network: string) {
    await this.page.getByTestId('account-button').click()
    await this.page.getByTestId('w3m-account-select-network').click()
    await this.page.getByTestId(`w3m-network-switch-${network}`).click()
    await this.page.getByTestId(`w3m-header-close`).click()
  }
}
