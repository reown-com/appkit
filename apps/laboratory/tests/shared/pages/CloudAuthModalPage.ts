import { expect } from '@playwright/test'

import { ModalPage } from './ModalPage'

export class CloudAuthModalPage extends ModalPage {
  get sessionAccountButton() {
    return this.page.getByTestId('cloud-auth-get-session-account-button')
  }

  get updateSessionAccountMetadataInput() {
    return this.page.getByTestId('cloud-auth-update-session-account-metadata')
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
