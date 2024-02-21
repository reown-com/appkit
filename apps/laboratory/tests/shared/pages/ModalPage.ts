import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
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
      flavor === 'default'
        ? `${this.baseURL}library/${this.library}/`
        : `${this.baseURL}library/${this.library}-${this.flavor}/`
  }

  async load() {
    await this.page.goto(this.url)
  }

  assertDefined<T>(value: T | undefined | null): T {
    expect(value).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return value!
  }

  async getConnectUri(): Promise<string> {
    await this.page.goto(this.url)
    await this.connectButton.click()
    const connect = this.page.getByTestId('wallet-selector-walletconnect')
    await connect.waitFor({
      state: 'visible',
      timeout: 5000
    })
    await connect.click()

    // Using getByTestId() doesn't work on my machine, I'm guessing because this element is inside of a <slot>
    const qrCode = this.page.locator('wui-qr-code')
    await expect(qrCode).toBeVisible()

    return this.assertDefined(await qrCode.getAttribute('uri'))
  }

  async loginWithEmail(email: string) {
    await this.page.goto(this.url)
    // Connect Button doesn't have a proper `disabled` attribute so we need to wait for the button to change the text
    await this.page
      .getByTestId('connect-button')
      .getByRole('button', { name: 'Connect Wallet' })
      .click()
    await this.page.getByTestId('wui-email-input').locator('input').focus()
    await this.page.getByTestId('wui-email-input').locator('input').fill(email)
    await this.page.getByTestId('wui-email-input').locator('input').press('Enter')
  }

  async enterOTP(otp: string) {
    const splitted = otp.split('')
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < splitted.length; i++) {
      const digit = splitted[i]
      if (!digit) {
        throw new Error('Invalid OTP')
      }
      /* eslint-disable no-await-in-loop */
      await this.page.getByTestId('wui-otp-input').locator('input').nth(i).focus()
      /* eslint-disable no-await-in-loop */
      await this.page.getByTestId('wui-otp-input').locator('input').nth(i).fill(digit)
    }

    await expect(this.page.getByText('Confirm Email')).not.toBeVisible()
  }

  async disconnect() {
    await this.page.getByTestId('account-button').click()
    await this.page.getByTestId('disconnect-button').click()
  }

  async sign() {
    await this.page.getByTestId('sign-message-button').click()
  }

  async approveSign() {
    await expect(
      this.page.frameLocator('#w3m-iframe').getByText('requests a signature')
    ).toBeVisible()
    await this.page.waitForTimeout(2000)
    await this.page
      .frameLocator('#w3m-iframe')
      .getByRole('button', { name: 'Sign', exact: true })
      .click()
  }

  async promptSiwe() {
    const siweSign = this.page.getByTestId('w3m-connecting-siwe-sign')
    await expect(siweSign).toBeEnabled()
    await siweSign.click()
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

  async clickWalletDeeplink() {
    await this.connectButton.click()
    await this.page.getByTestId('wallet-selector-react-wallet-v2').click()
    await this.page.getByTestId('tab-desktop').click()
  }
}
