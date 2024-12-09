import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'
import { browserExtensionFixture } from './shared/fixtures/extension-fixture'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const extensionTest = browserExtensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

extensionTest.describe.configure({ mode: 'serial' })

extensionTest.beforeAll(async ({ library, context }) => {
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'default')
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
  await modalPage.connectWithExtensionFlow()
  await modalValidator.expectConnected()
})

// -- Tests --------------------------------------------------------------------
extensionTest('it should sign a message', async () => {
  await modalPage.sign()
  await modalValidator.expectAcceptedSign()
})

extensionTest('it switch network', async () => {
  await modalPage.switchNetwork('Polygon')
  await modalValidator.expectSwitchedNetwork('Polygon')
})
