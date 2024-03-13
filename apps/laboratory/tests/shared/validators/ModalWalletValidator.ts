import { expect } from '@playwright/test'
import { ModalValidator } from './ModalValidator'

export class ModalWalletValidator extends ModalValidator {
  async expectActivateSmartAccountPromo() {
    await expect(
      this.page.getByTestId('activate-smart-account-promo'),
      'Activate smart account promo should be present'
    ).toContainText('unauthenticated')
  }

  async expectSmartAccountAddress() {
    const address = this.page.getByTestId('account-settings-address')

    await expect(address, 'Smart account sepolia address should be present').toHaveText(
      '0x2C...048FF4'
    )
  }

  async expectEoaAddress() {
    const address = this.page.getByTestId('account-settings-address')

    await expect(address, 'EOA address should be present').toHaveText('0x88...C080ee')
  }
}
