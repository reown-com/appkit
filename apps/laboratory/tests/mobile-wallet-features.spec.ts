import { type BrowserContext, test } from '@playwright/test'

import { ModalPage } from './shared/pages/ModalPage'
import { ModalValidator } from './shared/validators/ModalValidator'

const TRUST_WALLET_ID = '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
const OKX_WALLET_ID = '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709'

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
    await modalPage.openAllWallets()
    await modalPage.page.waitForTimeout(500)
    await modalPage.search(library === 'bitcoin' ? 'okx' : 'trust')
    await modalValidator.expectAllWalletsListSearchItem(
      library === 'bitcoin' ? OKX_WALLET_ID : TRUST_WALLET_ID
    )
  }
)

mobileWalletFeaturesTest('it should show open button', async ({ library }) => {
  await modalPage.clickAllWalletsListSearchItem(
    library === 'bitcoin' ? OKX_WALLET_ID : TRUST_WALLET_ID
  )
  await modalValidator.expectOpenButton({ disabled: true })
  await modalPage.page.waitForTimeout(2000)
  await modalValidator.expectOpenButton({ disabled: false })
})
