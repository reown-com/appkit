import { expect } from '@playwright/test'

import { ModalWalletPage } from './ModalWalletPage'

export class ReownAuthenticationModalPage extends ModalWalletPage {
  get sessionAccountButton() {
    return this.page.getByTestId('reown-authentication-get-session-account-button')
  }

  get updateSessionAccountMetadataInput() {
    return this.page.getByTestId('reown-authentication-update-session-account-metadata')
  }

  get updateSessionAccountMetadataButton() {
    return this.page.locator('button', { hasText: 'Update Session Account Metadata' })
  }

  async requestSessionAccount() {
    await this.sessionAccountButton.click()
  }

  async updateSessionAccountMetadata(data: unknown) {
    await this.updateSessionAccountMetadataInput.fill(JSON.stringify(data))
    await this.updateSessionAccountMetadataButton.click()

    await expect(this.page.getByText('The metadata has been updated successfully')).toBeVisible()
  }
}
