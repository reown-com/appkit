import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

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
  // Force extension to load the inpage script
  await modalPage.page.reload()
})

extensionTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
extensionTest('it should be authenticated', async () => {
  await modalValidator.expectOnSignInEventCalled(false)
  await modalPage.connectToExtension()
  await modalPage.promptSiwe()
  await modalValidator.expectConnected()
  await modalValidator.expectAuthenticated()
  await modalValidator.expectOnSignInEventCalled(true)
})

extensionTest('it should require re-authentication when switching networks', async () => {
  await modalPage.switchNetwork('Polygon')
  await modalPage.promptSiwe()
  await modalValidator.expectAuthenticated()
})

extensionTest('it should fallback to the last session when cancel siwe from AppKit', async () => {
  await modalPage.switchNetwork('Ethereum')
  await modalPage.cancelSiwe()
  await modalValidator.expectNetworkButton('Polygon')
  await modalValidator.expectAuthenticated()
})

extensionTest('it should be authenticated after connecting and refreshing the page', async () => {
  await modalValidator.expectConnected()
  await modalPage.page.reload()
  await modalValidator.expectConnected()
  await modalValidator.expectAuthenticated()
  await modalValidator.expectOnSignInEventCalled(false)
})

extensionTest('it should be unauthenticated after disconnecting', async () => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await modalValidator.expectUnauthenticated()
})

extensionTest('it should be unauthenticated when there is no previous session', async () => {
  await modalPage.page.reload()
  await modalPage.connectToExtension()
  await modalPage.promptSiwe({ cancel: true })
  await modalValidator.expectDisconnected()
  await modalValidator.expectUnauthenticated()
})
