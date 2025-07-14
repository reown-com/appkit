import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import {
  getNamespaceByLibrary,
  getTestnet2ByLibrary,
  getTestnetByLibrary
} from './shared/utils/namespace'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalWalletPage
let modalValidator: ModalValidator

// -- Setup --------------------------------------------------------------------
const extensionTest = extensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

extensionTest.describe.configure({ mode: 'serial' })

extensionTest.beforeAll(async ({ library, context }) => {
  const browserPage = await context.newPage()

  modalPage = new ModalWalletPage(browserPage, library, 'siwx')
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
  // Force extension to load the inpage script
  await modalPage.page.reload()
})

extensionTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
extensionTest('it should connect', async ({ browser }) => {
  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)
  const context = await browser.newContext()

  const emailAddress = await email.getEmailAddressToUse()
  await modalPage.emailFlow({
    emailAddress,
    context,
    mailsacApiKey
  })
  await modalPage.promptSiwe()
  await modalValidator.expectConnected()
})

extensionTest(
  'it should require request signature when switching networks',
  async ({ library }) => {
    const network = getTestnetByLibrary(library)

    await modalPage.switchNetwork(network)
    await modalPage.promptSiwe()
    await modalPage.approveSign()
    await modalPage.closeModal()
    await modalValidator.expectConnected()
  }
)

extensionTest(
  'it should fallback to the last session when cancel siwe from AppKit',
  async ({ library }) => {
    if (library === 'bitcoin') {
      return
    }

    const newNetwork = getTestnet2ByLibrary(library)
    const prevNetwork = getTestnetByLibrary(library)

    await modalPage.switchNetwork(newNetwork)
    await modalPage.cancelSiwe()
    await modalValidator.expectNetworkButton(prevNetwork)
    await modalValidator.expectConnected()
  }
)

extensionTest('it should be connected after connecting and refreshing the page', async () => {
  await modalValidator.expectConnected()
  await modalPage.page.reload()
  await modalValidator.expectConnected()
})

extensionTest('it should disconnect', async () => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})

extensionTest(
  'it should be disconnected when there is no previous session',
  async ({ library }) => {
    const namespace = getNamespaceByLibrary(library)

    await modalPage.page.reload()
    await modalPage.connectToExtensionMultichain(namespace)
    await modalPage.promptSiwe({ cancel: true })
    await modalValidator.expectDisconnected()
  }
)
