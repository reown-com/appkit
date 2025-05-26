/* eslint-disable no-await-in-loop */
import type { BrowserContext, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import type { ChainNamespace } from '@reown/appkit-common'

import { BASE_URL } from '../constants'
import { Email } from '../utils/email'
import { DeviceRegistrationPage } from './DeviceRegistirationPage'

export class DemoPage {
  public readonly page: Page
  private readonly url = BASE_URL

  constructor(page: Page) {
    this.page = page
  }

  async load() {
    await this.page.goto(this.url)
  }

  async openNetworks() {
    const hiddenButton = this.page.getByTestId('open-networks')
    // @ts-expect-error - click is not defined on the element
    await hiddenButton.evaluate(node => node.click())
    await expect(this.page.getByText('Choose Network')).toBeVisible()
  }

  async disableChainOption(namespace: ChainNamespace) {
    const chainOption = this.page.getByTestId(`chain-option-${namespace}`)
    await chainOption.click()

    await expect(chainOption).toHaveAttribute('data-enabled', 'false')
  }

  async disableNetworkOption(networkId: string) {
    const networkOption = this.page.getByTestId(`network-option-${networkId}`)
    await networkOption.click()
    await expect(networkOption).toHaveAttribute('data-enabled', 'false')
  }

  async verifyNetworkSwitch(networkSwitchTestId: string, shouldBeVisible: boolean) {
    const networkSwitch = this.page.getByTestId(networkSwitchTestId)
    const visibilityCheck = shouldBeVisible
      ? expect(networkSwitch).toBeVisible()
      : expect(networkSwitch).not.toBeVisible()
    await visibilityCheck
  }

  async verifyChainOptionEnabled(namespace: ChainNamespace, shouldBeEnabled: boolean) {
    const chainOption = this.page.getByTestId(`chain-option-${namespace}`)
    const enabledCheck = shouldBeEnabled ? 'true' : 'false'
    await expect(chainOption).toHaveAttribute('data-enabled', enabledCheck)
  }

  async verifyNetworkOptionEnabled(networkId: string | number, shouldBeEnabled: boolean) {
    const networkOption = this.page.getByTestId(`network-option-${networkId}`)
    const enabledCheck = shouldBeEnabled ? 'true' : 'false'
    await expect(networkOption).toHaveAttribute('data-enabled', enabledCheck)
  }

  async verifyNetworkAvailableOnAppKit(networkName: string, shouldBeVisible: boolean) {
    const networkSwitch = this.page.getByTestId(`w3m-network-switch-${networkName}`)
    const visibilityCheck = shouldBeVisible
      ? expect(networkSwitch).toBeVisible()
      : expect(networkSwitch).not.toBeVisible()
    await visibilityCheck
  }

  async emailFlow({
    emailAddress,
    context,
    mailsacApiKey,
    clickConnectButton = true
  }: {
    emailAddress: string
    context: BrowserContext
    mailsacApiKey: string
    clickConnectButton?: boolean
  }): Promise<void> {
    const email = new Email(mailsacApiKey)

    await email.deleteAllMessages(emailAddress)
    await this.loginWithEmail(emailAddress, undefined, clickConnectButton)

    const firstMessageId = await email.getLatestMessageId(emailAddress)
    if (!firstMessageId) {
      throw new Error('No messageId found')
    }

    const firstEmailBody = await email.getEmailBody(emailAddress, firstMessageId)
    let otp = ''
    if (email.isApproveEmail(firstEmailBody)) {
      const url = email.getApproveUrlFromBody(firstEmailBody)

      await email.deleteAllMessages(emailAddress)
      const newPage = await context.newPage()

      const drp = new DeviceRegistrationPage(newPage, url)
      await drp.load()

      await drp.approveDevice()
      await drp.close()

      const secondMessageId = await email.getLatestMessageId(emailAddress)
      if (!secondMessageId) {
        throw new Error('No messageId found')
      }

      const secondEmailBody = await email.getEmailBody(emailAddress, secondMessageId)
      if (email.isApproveEmail(secondEmailBody)) {
        throw new Error('Unexpected approve email after already approved')
      }
      otp = email.getOtpCodeFromBody(secondEmailBody)
    } else {
      otp = email.getOtpCodeFromBody(firstEmailBody)
    }

    await this.enterOTP(otp)
  }

  async loginWithEmail(email: string, validate = true, clickConnectButton = true) {
    if (clickConnectButton) {
      // Connect Button doesn't have a proper `disabled` attribute so we need to wait for the button to change the text
      await this.page
        .getByTestId('connect-button')
        .getByRole('button', { name: 'Connect Wallet' })
        .click()
    }
    await this.page.getByTestId('wui-email-input').locator('input').focus()
    await this.page.getByTestId('wui-email-input').locator('input').fill(email)
    await this.page.getByTestId('wui-email-input').locator('input').press('Enter')
    if (validate) {
      await expect(
        this.page.getByText(email),
        `Expected current email: ${email} to be visible on the notification screen`
      ).toBeVisible({
        timeout: 20_000
      })
    }
  }

  async enterOTP(otp: string, headerTitle = 'Confirm Email') {
    await expect(this.page.getByText(headerTitle)).toBeVisible({
      timeout: 10_000
    })
    await expect(this.page.getByText('Enter the code we sent')).toBeVisible({
      timeout: 10_000
    })

    const splitted = otp.split('')

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < splitted.length; i++) {
      const digit = splitted[i]
      if (!digit) {
        throw new Error('Invalid OTP')
      }
      const otpInput = this.page.getByTestId('wui-otp-input')
      const wrapper = otpInput.locator('wui-input-numeric').nth(i)
      await expect(wrapper, `Wrapper element for input ${i} should be visible`).toBeVisible({
        timeout: 5000
      })
      const input = wrapper.locator('input')
      await expect(input, `Input ${i} should be enabled`).toBeEnabled({
        timeout: 5000
      })
      await input.fill(digit)
    }

    await expect(this.page.getByText(headerTitle)).not.toBeVisible({
      timeout: 20_000
    })
  }
}
