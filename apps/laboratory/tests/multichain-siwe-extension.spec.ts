import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator

// -- Constants ----------------------------------------------------------------
const PATH_FOR_LIBRARIES = {
  wagmi: 'multichain-wagmi-solana-siwe',
  ethers: 'multichain-ethers-solana-siwe',
  ethers5: 'multichain-ethers5-solana-siwe'
}

// -- Helpers ------------------------------------------------------------------
async function switchNetworkAndMaybeSignSiwe(network: string, siwe = true) {
  await modalPage.switchNetwork(network)
  if (network === 'Solana') {
    await modalPage.switchActiveChain()
    await modalValidator.expectOnSignOutEventCalled(true)
    modalPage.closeModal()
  }
  if (siwe) {
    await modalPage.promptSiwe()
  }

  await modalValidator.expectNetworkButton(network)
}

// -- Setup --------------------------------------------------------------------
const extensionTest = extensionFixture.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

extensionTest.describe.configure({ mode: 'serial' })

extensionTest.beforeAll(async ({ context, library }) => {
  const browserPage = await context.newPage()
  const path = PATH_FOR_LIBRARIES[library as keyof typeof PATH_FOR_LIBRARIES]

  if (!path) {
    throw new Error(`Path for library "${library}" not found`)
  }

  modalPage = new ModalPage(browserPage, path, 'default')
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
  await modalPage.connectToExtensionMultichain('eip155')
  await modalPage.promptSiwe()
  await modalValidator.expectConnected()
})

extensionTest('it should switch networks and sign siwe', async () => {
  let network = 'Polygon'
  await switchNetworkAndMaybeSignSiwe(network)
  await modalValidator.expectConnected()

  network = 'Base'
  await switchNetworkAndMaybeSignSiwe(network)
  await modalValidator.expectConnected()

  network = 'OP Mainnet'
  await switchNetworkAndMaybeSignSiwe(network)
  await modalValidator.expectConnected()

  network = 'Solana'
  await switchNetworkAndMaybeSignSiwe(network, false)
  // Solana doesn't prompt siwe on network switch
  await modalValidator.expectNetworkButton('Solana')
  await modalValidator.expectUnauthenticated()

  network = 'Ethereum'
  await modalPage.switchNetworkWithNetworkButton(network)
})

extensionTest('it should reload the page and sign siwe if not authenticated', async () => {
  await modalPage.page.reload()
  await modalValidator.expectConnected()
  await modalPage.promptSiwe()
  await modalValidator.expectConnected()
})
