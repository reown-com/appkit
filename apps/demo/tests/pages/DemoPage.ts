import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { ChainNamespace } from '@reown/appkit-common'

import { BASE_URL } from '../constants'

export class DemoPage {
  public readonly page: Page
  private readonly url: string

  constructor(page: Page) {
    this.page = page
    this.url = BASE_URL
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
}
