import { type BrowserContext } from '@playwright/test'

import { WalletPage } from '@reown/appkit-testing'

import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { Email } from './shared/utils/email'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let walletPage: WalletPage
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const test = extensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ context: browserContext, library }) => {
  context = browserContext
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'flag-enable-reconnect')
  walletPage = new WalletPage(await context.newPage())
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
})

test.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
test.describe('Email', () => {
  test('it should connect with Email and got disconnected after page refresh', async () => {
    const mailsacApiKey = process.env['MAILSAC_API_KEY']
    if (!mailsacApiKey) {
      throw new Error('MAILSAC_API_KEY is not set')
    }
    const email = new Email(mailsacApiKey)
    const tempEmail = await email.getEmailAddressToUse()

    // Connect with email
    modalValidator.expectSecureSiteFrameNotInjected()
    await modalPage.emailFlow({ emailAddress: tempEmail, context, mailsacApiKey })
    await modalValidator.expectConnected()

    // Reload and check connection
    await modalPage.page.reload()
    await modalValidator.expectDisconnected()
    await modalValidator.expectStatus('disconnected')
  })
})

test.describe('WC', () => {
  test('it should connect with WC and got disconnected after page refresh', async () => {
    // Connect with WC
    await modalPage.qrCodeFlow(modalPage, walletPage)
    await modalValidator.expectConnected()

    // Reload and check connection
    await modalPage.page.reload()
    await modalValidator.expectDisconnected()
    await modalValidator.expectStatus('disconnected')
  })
})

test.describe('Extension', () => {
  test('it should connect with Reown Extension and got disconnected after page refresh', async ({
    browserName
  }) => {
    const isFirefox = browserName === 'firefox'

    if (isFirefox) {
      return
    }
    // Connect with Reown Extension
    await modalPage.connectToExtensionMultichain('solana')

    // Reload and check connection
    await modalPage.page.reload()
    await modalValidator.expectDisconnected()
    await modalValidator.expectStatus('disconnected')
  })
})
