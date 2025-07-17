import { timingFixture } from './shared/fixtures/timing-fixture'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import { getTestnet2ByLibrary, getTestnetByLibrary } from './shared/utils/namespace'
import { ModalValidator } from './shared/validators/ModalValidator'

/* eslint-disable init-declarations */
let modalPage: ModalWalletPage
let modalValidator: ModalValidator

const targetLibraries = ['ethers', 'solana']

// -- Setup --------------------------------------------------------------------
const siwxEmailTest = timingFixture.extend<{ library: string }>({
  library: ['ethers', { option: true }]
})

siwxEmailTest.describe.configure({ mode: 'serial' })

siwxEmailTest.beforeAll(async ({ library, browser }) => {
  if (!targetLibraries.includes(library)) {
    return
  }
  const context = await browser.newContext()
  const browserPage = await context.newPage()

  modalPage = new ModalWalletPage(browserPage, library, 'siwx')
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()

  siwxEmailTest.setTimeout(300000)

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)

  const emailAddress = await email.getEmailAddressToUse()
  await modalPage.emailFlow({
    emailAddress,
    context,
    mailsacApiKey
  })

  // Should do 1CA, so no need to approve prompt siwe
  await modalValidator.expectConnected()
})

siwxEmailTest(
  'it should require request signature when switching networks',
  async ({ library }) => {
    if (!targetLibraries.includes(library)) {
      return
    }
    const network = getTestnetByLibrary(library)

    await modalPage.switchNetwork(network)
    await modalPage.promptSiwe()
    await modalPage.approveSign()
    await modalValidator.expectConnected()
  }
)

siwxEmailTest(
  'it should fallback to the last session when cancel siwe from AppKit',
  async ({ library }) => {
    if (!targetLibraries.includes(library)) {
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

siwxEmailTest(
  'it should be connected after connecting and refreshing the page',
  async ({ library }) => {
    if (!targetLibraries.includes(library)) {
      return
    }
    await modalPage.page.reload()
    await modalValidator.expectConnected()
  }
)

siwxEmailTest('it should disconnect', async ({ library }) => {
  if (!targetLibraries.includes(library)) {
    return
  }
  await modalPage.disconnectWithHook()
  await modalValidator.expectDisconnected()
})
