/* eslint-disable max-classes-per-file */
import { type BrowserContext, expect, test } from '@playwright/test'

import { BASE_URL } from './shared/constants'
import { ModalPage } from './shared/pages/ModalPage'
import { WalletPage } from './shared/pages/WalletPage'
import { ModalValidator } from './shared/validators/ModalValidator'

class CloudAuthModalValidator extends ModalValidator {
  get sessionStatus() {
    return this.page.getByTestId('cloud-auth-session-status')
  }

  get sessionAccount() {
    return this.page.getByTestId('cloud-auth-session-account')
  }

  async expectEmptySession() {
    await expect(this.sessionStatus).toHaveText('No session detected yet')
  }

  async expectSession() {
    const text = await this.sessionStatus.innerText()
    const object = JSON.parse(text)

    expect(object).toMatchObject({
      message: expect.any(String),
      signature: expect.any(String),
      data: expect.any(Object)
    })

    return object
  }

  async expectSessionAccount() {
    const text = await this.sessionAccount.innerText()
    const object = JSON.parse(text)

    expect(object).toMatchObject(expect.any(Object))

    return object
  }
}

class CloudAuthModalPage extends ModalPage {
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

/* eslint-disable init-declarations */
let modalPage: CloudAuthModalPage
let modalValidator: CloudAuthModalValidator
let walletPage: WalletPage
let context: BrowserContext
/* eslint-enable init-declarations */

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()

  modalPage = new CloudAuthModalPage(await context.newPage(), 'library', 'default')
  modalValidator = new CloudAuthModalValidator(modalPage.page)
  walletPage = new WalletPage(await context.newPage())

  await walletPage.load()
  await modalPage.page.goto(`${BASE_URL}library/siwx-cloud-auth`)
  await modalValidator.expectDisconnected()
})

test.afterAll(async () => {
  await context.close()
})

test('should have no session account', async () => {
  await modalValidator.expectEmptySession()
})

test('should be authenticated', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage)
  await modalValidator.expectConnected()
  await modalValidator.expectSession()
})

test('should keep session after page reload', async () => {
  await modalPage.page.reload()
  await modalValidator.expectConnected()
  await modalValidator.expectSession()
})

test('should get session account', async () => {
  await modalPage.requestSessionAccount()
  await modalValidator.expectSessionAccount()
})

test('should update session account metadata', async () => {
  const metadata = { username: 'satoshi' }
  await modalPage.updateSessionAccountMetadata(metadata)

  await modalPage.requestSessionAccount()
  const sessionAccount = await modalValidator.expectSessionAccount()
  expect(sessionAccount.appKitAccount.metadata).toMatchObject(metadata)
})

test('should disconnect session account', async () => {
  await modalPage.disconnect()
  await modalValidator.expectEmptySession()
})
