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

  modalPage = new ModalPage(browserPage, library, 'siwx')
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
  // Force extension to load the inpage script
  await modalPage.page.reload()
})

extensionTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
extensionTest('it should connect', async () => {
  await modalPage.connectToExtensionMultichain('solana')
  await modalPage.promptSiwe()
  await modalValidator.expectConnected()
})

extensionTest('it should require request signature when switching networks', async () => {
  await modalPage.switchNetwork('Solana Devnet')
  await modalPage.promptSiwe()
  await modalValidator.expectConnected()
})

extensionTest('it should disconnect when cancel siwe from AppKit', async () => {
  await modalPage.switchNetwork('Solana Testnet')
  await modalPage.cancelSiwe()
  await modalValidator.expectDisconnected()
})

extensionTest('it should be connected after connecting and refreshing the page', async () => {
  await modalPage.connectToExtensionMultichain('solana')
  await modalPage.promptSiwe()
  await modalValidator.expectConnected()
  // Reload the page
  await modalPage.page.reload()
  await modalValidator.expectConnected()
})

extensionTest('it should disconnected', async () => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})
