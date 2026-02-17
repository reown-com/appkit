import { type BrowserContext, test } from '@playwright/test'

import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

const TRUST_WALLET_ID = '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
const OKX_WALLET_ID = '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709'
// React Native Sample Wallet
const REACT_NATIVE_WALLET_ID = 'rn-web3wallet'
// Cypher Wallet
const CYPHER_WALLET_ID = 'f2436c67184f158d1beda5df53298ee84abfc367581e4505134b5bcf5f46697d'

// Wallet configuration map by library
const WALLET_CONFIG: Record<string, { searchTerm: string; walletId: string }> = {
  bitcoin: { searchTerm: 'okx', walletId: OKX_WALLET_ID },
  ton: { searchTerm: 'react native sample wallet', walletId: REACT_NATIVE_WALLET_ID },
  tron: { searchTerm: 'cypher', walletId: CYPHER_WALLET_ID },
  default: { searchTerm: 'trust', walletId: TRUST_WALLET_ID }
}

/* eslint-disable init-declarations */
let modalPage: ModalPage
let modalValidator: ModalValidator
let context: BrowserContext

// -- Setup --------------------------------------------------------------------
const mobileWalletFeaturesTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

mobileWalletFeaturesTest.describe.configure({ mode: 'serial' })

mobileWalletFeaturesTest.beforeAll(async ({ browser, library }) => {
  context = await browser.newContext()
  const browserPage = await context.newPage()

  modalPage = new ModalPage(browserPage, library, 'default')
  modalValidator = new ModalValidator(browserPage)

  await modalPage.load()
  await modalPage.openConnectModal()
})

mobileWalletFeaturesTest.afterAll(async () => {
  await modalPage.page.close()
})

// -- Tests --------------------------------------------------------------------
mobileWalletFeaturesTest('it should show all wallets option', async () => {
  await modalValidator.expectAllWallets()
})

mobileWalletFeaturesTest(
  'it should show all wallets view and connect to a wallet',
  async ({ library }) => {
    if (library === 'ton' || library === 'tron') {
      return
    }

    const walletConfig = WALLET_CONFIG[library] || WALLET_CONFIG['default']

    if (!walletConfig) {
      throw new Error(`No wallet config found for library: ${library}`)
    }

    await modalPage.openAllWallets()
    await modalPage.page.waitForTimeout(500)
    await modalPage.search(walletConfig.searchTerm)
    await modalValidator.expectAllWalletsListSearchItem(walletConfig.walletId)
  }
)

mobileWalletFeaturesTest('it should show open button', async ({ library }) => {
  if (library === 'ton' || library === 'tron') {
    return
  }

  const walletConfig = WALLET_CONFIG[library] || WALLET_CONFIG['default']

  if (!walletConfig) {
    throw new Error(`No wallet config found for library: ${library}`)
  }

  await modalPage.clickAllWalletsListSearchItem(walletConfig.walletId)
  await modalValidator.expectOpenButton({ disabled: true })
  await modalPage.page.waitForTimeout(2000)
  await modalValidator.expectOpenButton({ disabled: false })
})
