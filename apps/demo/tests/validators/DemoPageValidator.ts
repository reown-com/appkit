import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

import type { ChainNamespace } from '@reown/appkit-common'
import { getMaximumWaitConnections } from '@reown/appkit-testing'

const MAX_WAIT = getMaximumWaitConnections()

export class DemoPageValidator {
  public readonly page: Page
  constructor(page: Page) {
    this.page = page
  }

  expectSecureSiteFrameNotInjected() {
    const secureSiteIframe = this.page.frame({ name: 'w3m-secure-iframe' })
    expect(secureSiteIframe).toBeNull()
  }

  async expectBalanceFetched(currency: 'SOL' | 'ETH' | 'BTC' | 'POL') {
    const accountButton = this.page.locator('appkit-account-button').first()
    await expect(accountButton, `Account button should show balance as ${currency}`).toContainText(
      `0.000 ${currency}`
    )
  }

  async expectOnrampButton(visible: boolean) {
    const onrampButton = this.page.getByTestId('w3m-account-default-onramp-button')
    if (visible) {
      await expect(onrampButton).toBeVisible()
    } else {
      await expect(onrampButton).not.toBeVisible()
    }
  }

  async expectToBeConnected(namespace: ChainNamespace) {
    if (namespace === 'eip155') {
      const profileButton = this.page.getByTestId('wui-profile-button')
      await expect(profileButton, 'Profile button should be present').toBeVisible()
    } else if (namespace === 'solana') {
      const solanaText = this.page.locator('wui-text').getByText('SOL')
      await expect(solanaText, 'SOL text should be present').toBeVisible()
    } else if (namespace === 'bip122') {
      const bitcoinText = this.page.locator('wui-text').getByText('BTC')
      await expect(bitcoinText, 'BTC text should be present').toBeVisible()
    } else {
      throw new Error(`Unsupported namespace: ${namespace}`)
    }
  }

  async expectConnected(profileButtonV2 = false) {
    const connectView = this.page.locator('w3m-connect-view').first()
    const profileButton = this.page
      .locator(profileButtonV2 ? 'wui-profile-button-v2' : 'wui-profile-button')
      .first()

    await expect(connectView, 'Connect view should be present').not.toBeVisible()
    await expect(profileButton, 'Profile button should be present').toBeVisible({
      timeout: MAX_WAIT
    })
    await this.page.waitForTimeout(500)
  }

  async expectSwitchedNetworkOnNetworksView(name: string) {
    const networkOptions = this.page.getByTestId(`w3m-network-switch-${name}`)
    await expect(networkOptions.locator('wui-icon')).toBeVisible()
  }

  async expectSwitchedNetworkOnHeaderButton(name: string) {
    const networkButton = this.page.getByTestId('w3m-account-select-network')
    await expect(networkButton).toHaveAttribute('active-network', name)
  }
}
