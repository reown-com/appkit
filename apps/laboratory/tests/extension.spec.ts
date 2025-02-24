import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator

// -- Helpers ------------------------------------------------------------------
function getNetworks(library: string) {
  if (library === 'solana') {
    return ['Solana Testnet', 'Solana Devnet', 'Solana']
  }

  return ['Polygon', 'Base', 'Ethereum']
}

// -- Setup --------------------------------------------------------------------
const extensionTest = extensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

extensionTest.describe.configure({ mode: 'serial' })

extensionTest.beforeAll(async ({ library, context }) => {
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'default')
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
  // Force extension to load the inpage script
  await modalPage.page.reload()
})

// -- Tests --------------------------------------------------------------------
extensionTest('it should connect', async () => {
  await modalPage.connectToExtension()
  await modalValidator.expectConnected()
})

extensionTest('it should sign message', async ({ library }) => {
  const namespace = library === 'solana' ? 'solana' : 'eip155'
  await modalPage.sign(namespace)
  await modalValidator.expectAcceptedSign()
  // Wait for the toast animation to complete
  await modalValidator.page.waitForTimeout(500)
})

extensionTest('it should sign typed data', async ({ library }) => {
  const namespace = library === 'solana' ? 'solana' : 'eip155'

  if (library === 'solana') {
    return
  }

  await modalPage.signTypedData(namespace)
  await modalValidator.expectAcceptedSignTypedData()
})

extensionTest('it should switch to different networks and sign', async ({ library }) => {
  const networks = getNetworks(library)

  /* eslint-disable no-await-in-loop */
  for (const network of networks) {
    await modalPage.switchNetwork(network)
    await modalValidator.expectSwitchedNetwork(network)
    await modalPage.closeModal()
    await modalPage.sign()
    await modalValidator.expectAcceptedSign()
    await modalValidator.expectNetworkButton(network)
  }
})

extensionTest('it should be connected after page refresh', async () => {
  await modalPage.page.reload()
  await modalValidator.expectConnected()
})

extensionTest('it should show last connected network after page refresh', async ({ library }) => {
  const networks = getNetworks(library)
  const lastNetwork = networks[networks.length - 1]
  // Make sure the wallet is connected to the last selected network
  await modalValidator.expectNetworkButton(lastNetwork as string)
})

extensionTest('it should disconnect', async () => {
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
})
