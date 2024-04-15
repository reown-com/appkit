import { expect } from '@playwright/test'
import { ModalValidator } from './ModalValidator'

export const EOA = 'EOA'
export const SMART_ACCOUNT = 'smart account'

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
  }

  async expectAddress(expectedAddress: string) {
    const address = this.page.getByTestId('account-settings-address')

    await expect(address, 'Correct address should be present').toHaveText(expectedAddress)
  }
}
