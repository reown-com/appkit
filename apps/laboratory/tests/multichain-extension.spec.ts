import { getNamespaceByNetworkName } from '@/tests/shared/utils/namespace'

import { extensionFixture } from './shared/fixtures/extension-fixture'
import { ModalPage } from './shared/pages/ModalPage'
import { Email } from './shared/utils/email'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator

// -- Constants ----------------------------------------------------------------
const PATH_FOR_LIBRARIES = {
  wagmi: 'multichain-wagmi-solana',
  ethers: 'multichain-ethers-solana',
  ethers5: 'multichain-ethers5-solana'
}

// -- Helpers ------------------------------------------------------------------
async function reloadAndSign(network: string) {
  await modalPage.page.reload()
  await modalValidator.checkConnectionStatus('connected', network)
  await modalPage.signMessageAndTypedData(modalValidator, network, 'eip155')
}

async function switchNetworkAndSign(network: string) {
  const namespace = getNamespaceByNetworkName(network)

  await modalPage.switchNetwork(network, true)
  await modalValidator.checkConnectionStatus('connected', network)
  await modalPage.closeModal()
  await modalPage.signMessageAndTypedData(modalValidator, network, namespace)
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
  await modalPage.connectToExtensionMultichain('solana')
  await modalValidator.expectConnected()
})

extensionTest('it should switch networks and sign', async () => {
  let network = 'Polygon'

  await modalPage.switchNetwork(network, true)
  await modalPage.switchActiveChain()
  await modalValidator.checkConnectionStatus('loading', network)

  await modalPage.connectToExtensionMultichain('eip155', true, true)
  await modalValidator.checkConnectionStatus('connected', network)

  await switchNetworkAndSign(network)
  await reloadAndSign(network)

  network = 'Solana'
  await switchNetworkAndSign(network)
  await reloadAndSign(network)
})

extensionTest('it should stay connected to the same network after page refresh', async () => {
  await modalPage.page.reload()
  await modalValidator.expectConnected()
  // Check if Solana is the connected network
  await modalValidator.expectNetworkButton('Solana')
})

extensionTest('it should disconnect and close modal', async () => {
  await modalPage.disconnect()
  await modalValidator.expectModalNotVisible()
  await modalValidator.expectDisconnected()
})

extensionTest(
  'it should connect with extension on Solana, switch to different chain with auth connector, switch back to Solana and persist extension state',
  async () => {
    await modalPage.connectToExtensionMultichain('solana')
    await modalValidator.expectConnected()
    const solanaAddress = (await modalPage.page.getByTestId('w3m-address').textContent()) as string

    await modalPage.switchNetwork('Ethereum', true)
    await modalPage.switchActiveChain()

    const mailsacApiKey = process.env['MAILSAC_API_KEY']
    if (!mailsacApiKey) {
      throw new Error('MAILSAC_API_KEY is not set')
    }

    const email = new Email(mailsacApiKey)
    await modalPage.emailFlow({
      emailAddress: await email.getEmailAddressToUse(),
      context: modalPage.page.context(),
      mailsacApiKey,
      clickConnectButton: false
    })
    await modalValidator.expectConnected()
    await modalPage.switchNetwork('Solana', true)
    await modalPage.closeModal()
    await modalValidator.expectConnected()
    await modalValidator.expectAddress(solanaAddress)
    await modalPage.disconnect()
  }
)

extensionTest('it should be disconnected after page refresh', async () => {
  await modalPage.page.reload()
  await modalValidator.expectDisconnected()
})
