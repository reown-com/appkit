import { type BrowserContext, test } from '@playwright/test'

import { DEFAULT_CHAIN_NAME } from '@reown/appkit-testing'

import { ModalWalletPage } from '../shared/pages/ModalWalletPage'
import { Email } from '../shared/utils/email'
import { getNamespaceByNetworkName } from '../shared/utils/namespace'
import { ModalWalletValidator } from '../shared/validators/ModalWalletValidator'

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

  page = new ModalWalletPage(browserPage, 'multichain-wagmi-solana', 'default')
  validator = new ModalWalletValidator(browserPage)

  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)
  const tempEmail = await email.getEmailAddressToUse()
  await page.emailFlow({ emailAddress: tempEmail, context, mailsacApiKey })

  await validator.expectConnected()
})

test.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
test('it should switch networks (including different namespaces) and sign', async () => {
  const chains = ['Polygon', 'Solana', 'OP Mainnet']

  async function processChain(index: number) {
    if (index >= chains.length) {
      return
    }

    const chainName = chains[index] ?? DEFAULT_CHAIN_NAME
    await page.switchNetwork(chainName)
    await page.page.waitForTimeout(200)
    await validator.expectSwitchedNetwork(chainName)
    await page.closeModal()

    // -- Refresh and verify connection persists ----------------------------------
    await page.page.reload()
    await validator.expectConnected()
    await page.openModal()
    await page.openNetworks()
    await validator.expectSwitchedNetwork(chainName)
    await page.closeModal()

    // -- Sign ------------------------------------------------------------------
    await page.sign(getNamespaceByNetworkName(chainName))
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
