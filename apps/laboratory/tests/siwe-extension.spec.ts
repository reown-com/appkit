import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'
import { extensionFixture } from './shared/fixtures/extension-fixture'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator

// -- Setup --------------------------------------------------------------------
const extensionTest = extensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

extensionTest.describe.configure({ mode: 'serial' })

extensionTest.beforeAll(async ({ library, context }) => {
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'siwe')
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
  /*
   * Playwright may delay loading the extension, causing the inpage script (from the extension)
   * to not load and preventing the EIP6963 connector from being announced. Reloading the page fixes this for now.
   */
  await modalPage.page.reload()
})

extensionTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
extensionTest('it should be authenticated', async ({ library }) => {
  await modalValidator.expectOnSignInEventCalled(false)
  await modalPage.connectToExtension(library)
  await modalPage.promptSiwe()
  await modalValidator.expectConnected()
  await modalValidator.expectAuthenticated()
  await modalValidator.expectOnSignInEventCalled(true)
})

extensionTest('it should require re-authentication when switching networks', async () => {
  await modalPage.switchNetwork('Polygon')
  await modalValidator.expectUnauthenticated()
  await modalValidator.expectOnSignOutEventCalled(true)
  await modalPage.promptSiwe()
  await modalValidator.expectAuthenticated()
})

extensionTest('it should disconnect when cancel siwe from AppKit', async () => {
  await modalPage.switchNetwork('Ethereum')
  await modalValidator.expectUnauthenticated()
  await modalPage.cancelSiwe()
  await modalValidator.expectDisconnected()
  await modalValidator.expectUnauthenticated()
})

extensionTest(
  'it should be authenticated after connecting and refreshing the page',
  async ({ library }) => {
    await modalPage.connectToExtension(library)
    await modalPage.promptSiwe()
    await modalValidator.expectConnected()
    // Reload the page
    await modalPage.page.reload()
    await modalValidator.expectConnected()
    await modalValidator.expectAuthenticated()
    await modalValidator.expectOnSignInEventCalled(false)
    await modalPage.sign()
    await modalValidator.expectAcceptedSign()
    await modalPage.disconnect()
    await modalValidator.expectDisconnected()
    await modalValidator.expectUnauthenticated()
  }
)

extensionTest('it should be unauthenticated after disconnecting', async ({ library }) => {
  await modalPage.connectToExtension(library)
  await modalPage.promptSiwe()
  await modalValidator.expectConnected()
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await modalValidator.expectUnauthenticated()
})
