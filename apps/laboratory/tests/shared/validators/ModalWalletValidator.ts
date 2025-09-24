import { expect } from '@playwright/test'

import { ModalValidator } from './ModalValidator'

export const EOA = 'EOA'
export const SMART_ACCOUNT = 'Smart Account'

type AccountType = typeof EOA | typeof SMART_ACCOUNT

export class ModalWalletValidator extends ModalValidator {
  async expectActivateSmartAccountPromoVisible(visible: boolean) {
    const promo = this.page.getByTestId('activate-smart-account-promo')
    if (visible) {
      await expect(promo, 'Activate smart account promo should be present').toBeVisible()
    } else {
      await expect(promo, 'Activate smart account promo should not be present').toBeHidden()
    }
  }

  async expectTogglePreferredTypeVisible(visible: boolean) {
    const toggle = this.page.getByTestId('account-toggle-preferred-account-type')
    if (visible) {
      await expect(toggle, 'Smart account toggle should be present').toBeVisible()
    } else {
      await expect(toggle, 'Smart account toggle should not be present').toBeHidden()
    }
  }

  async expectChangePreferredAccountToShow(type: AccountType) {
    await expect(
      this.page.getByTestId('account-toggle-preferred-account-type'),
      'Preferred account toggle should show correct value'
    ).toContainText(type)
    await this.page.waitForTimeout(1000)
  }

  async expectCallStatusPending() {
    const closeButton = this.page.locator('#toast-close-button')

    await expect(closeButton).toBeVisible()
    await closeButton.click()
  }

  async expectReceivedSign({ chainName = 'Ethereum' }) {
    await expect(
      this.page.getByText('Approve Transaction'),
      'Approve Transaction text should be visible'
    ).toBeVisible({
      timeout: 10_000
    })
    expect(
      this.page.getByText(chainName),
      `${chainName} should be visible on approve transaction page`
    ).toBeTruthy()
  }

  async expectNamesFeatureVisible(visible: boolean) {
    const namesFeature = this.page.getByTestId('account-choose-name-button')
    if (visible) {
      await expect(namesFeature, 'Names feature should be present').toBeVisible()
    } else {
      await expect(namesFeature, 'Names feature should not be present').toBeHidden()
    }
  }
}
