/* eslint-disable no-await-in-loop */
import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ModalPage } from './ModalPage'

export class ModalWalletPage extends ModalPage {
  constructor(
    public override readonly page: Page,
    public override readonly library: string,
    public override readonly flavor: 'wallet' | 'all' = 'wallet'
  ) {
    super(page, library, flavor)
  }

  async openSettings() {
    await this.page.getByTestId('wui-profile-button').click()
  }

  override async switchNetwork(network: string) {
    await this.page.getByTestId('account-switch-network-button').click()
    await this.page.getByTestId(`w3m-network-switch-${network}`).click()
  }

  async togglePreferredAccountType() {
    await this.page.getByTestId('account-toggle-preferred-account-type').click()
  }

  override async disconnect(): Promise<void> {
    const disconnectBtn = this.page.getByTestId('disconnect-button')
    await expect(disconnectBtn, 'Disconnect button should be visible').toBeVisible()
    await expect(disconnectBtn, 'Disconnect button should be enabled').toBeEnabled()
    await disconnectBtn.click()
    await this.page.getByTestId('connect-button').waitFor({ state: 'visible', timeout: 5000 })
  }

  async getAddress(): Promise<string> {
    const address = await this.page.getByTestId('account-settings-address').textContent()
    expect(address, 'Address should be present').toBeTruthy()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return address!
  }
}
