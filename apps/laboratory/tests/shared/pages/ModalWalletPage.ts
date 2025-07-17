/* eslint-disable no-await-in-loop */
import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

import { setupNetworkListener } from '@/src/utils/NetworkUtil'

import { ModalPage } from './ModalPage'

type ModalWalletFlavor = 'default' | 'all' | 'siwe' | 'siwx'

export class ModalWalletPage extends ModalPage {
  public override readonly page: Page
  public override readonly library: string
  public override readonly flavor: ModalWalletFlavor

  constructor(page: Page, library: string, flavor: ModalWalletFlavor) {
    super(page, library, flavor)
    setupNetworkListener(page)
    this.page = page
    this.library = library
    this.flavor = flavor
  }

  async goToSettings() {
    await this.openAccount()
    await this.openProfileView()
    await this.openSettings()
  }

  async goToProfileWalletsView() {
    await this.openAccount()
    await this.clickWalletSwitchButton()
  }

  async openSettings() {
    await this.page.getByTestId('account-settings-button').click()
  }

  async openChooseNameIntro() {
    await this.page.getByTestId('account-choose-name-button').click()
  }

  async openChooseName() {
    await this.page.getByRole('button', { name: 'Choose Name' }).click()
  }

  async clickAccountName(name: string) {
    const suggestion = this.page.getByTestId('account-name-suggestion').getByText(name)
    await expect(suggestion).toBeVisible()
    await suggestion.click()
  }

  async typeName(name: string) {
    await this.page.getByTestId('wui-ens-input').getByTestId('wui-input-text').fill(name)
  }

  async togglePreferredAccountType() {
    const toggleButton = this.page.getByTestId('account-toggle-preferred-account-type')
    await expect(toggleButton, 'Toggle button should be visible').toBeVisible()
    await expect(toggleButton, 'Toggle button should be enabled').toBeEnabled()
    await toggleButton.click()
    const loadingSpinner = this.page.getByTestId('wui-list-item-loading-spinner')
    await expect(loadingSpinner, 'Loading spinner should be visible').toBeVisible()
    await expect(loadingSpinner, 'Loading spinner should not be visible').toBeHidden()
  }

  override async disconnect(): Promise<void> {
    const disconnectBtn = this.page.getByTestId('disconnect-button')
    await expect(disconnectBtn, 'Disconnect button should be visible').toBeVisible()
    await expect(disconnectBtn, 'Disconnect button should be enabled').toBeEnabled()
    await disconnectBtn.click()
    await this.page.getByTestId('connect-button').waitFor({ state: 'visible', timeout: 5000 })
  }
}
