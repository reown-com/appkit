import { test, type BrowserContext } from '@playwright/test'
import { DEFAULT_CHAIN_NAME } from '../shared/constants'
import { ModalWalletPage } from '../shared/pages/ModalWalletPage'
import { ModalWalletValidator } from '../shared/validators/ModalWalletValidator'
import { Email } from '../shared/utils/email'

/* eslint-disable init-declarations */
let page: ModalWalletPage
let validator: ModalWalletValidator
let context: BrowserContext
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  page = new ModalWalletPage(browserPage, 'multichain-ethers5-solana', 'default')
  validator = new ModalWalletValidator(browserPage)

  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)
  const tempEmail = await email.getEmailAddressToUse()
  await page.emailFlow(tempEmail, context, mailsacApiKey)

  await validator.expectConnected()
})

test.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
test('it should switch networks (including different namespaces) and sign', async () => {
  const chains = ['Polygon', 'Solana']

  async function processChain(index: number) {
    if (index >= chains.length) {
      return
    }

    const chainName = chains[index] ?? DEFAULT_CHAIN_NAME
    await page.switchNetwork(chainName)
    await validator.expectSwitchedNetwork(chainName)
    await page.closeModal()

    // -- Sign ------------------------------------------------------------------
    await page.sign()
    // For Solana, the chain name on the wallet page is Solana Mainnet
    const chainNameOnWalletPage = chainName === 'Solana' ? 'Solana Mainnet' : chainName
    await validator.expectReceivedSign({ chainName: chainNameOnWalletPage })
    await page.approveSign()
    await validator.expectAcceptedSign()

    await processChain(index + 1)
  }

  // Start processing from the first chain
  await processChain(0)
})
