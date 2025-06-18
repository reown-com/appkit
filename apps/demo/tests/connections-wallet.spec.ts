import { test } from '@playwright/test'

import { WalletPage } from '@reown/appkit-testing'

import { DemoPage } from './pages/DemoPage'
import { DemoPageValidator } from './validators/DemoPageValidator'

/* eslint-disable init-declarations */
let appPage: DemoPage
let validator: DemoPageValidator
let walletPage: WalletPage
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const browserPage = await context.newPage()

  appPage = new DemoPage(browserPage)
  walletPage = new WalletPage(await context.newPage())
  validator = new DemoPageValidator(browserPage)

  await appPage.load()
  await appPage.qrCodeFlow(appPage, walletPage)
  await validator.expectConnected(true)
})

test.afterAll(async () => {
  await appPage.page.close()
})

// -- Tests --------------------------------------------------------------------
test('it should be connected after page refresh', async () => {
  await appPage.page.reload()
  await validator.expectToBeConnected('eip155')
})

test('it should switch networks as expected', async () => {
  let networkName = 'Polygon'

  await appPage.openNetworks()
  await appPage.switchNetwork(networkName)
  await validator.expectSwitchedNetworkOnNetworksView(networkName)
  await appPage.goBack()
  await validator.expectSwitchedNetworkOnHeaderButton(networkName)

  await appPage.page.reload()
  await validator.expectToBeConnected('eip155')
  await validator.expectSwitchedNetworkOnHeaderButton(networkName)

  networkName = 'Solana'
  await appPage.openNetworks()
  await appPage.switchNetwork(networkName)
  await validator.expectSwitchedNetworkOnNetworksView(networkName)
  await appPage.goBack()
  await validator.expectSwitchedNetworkOnHeaderButton(networkName)

  await appPage.page.reload()
  await validator.expectToBeConnected('solana')
  await validator.expectSwitchedNetworkOnHeaderButton(networkName)

  networkName = 'Bitcoin'
  await appPage.openNetworks()
  await appPage.switchNetwork(networkName)
  await validator.expectSwitchedNetworkOnNetworksView(networkName)
  await appPage.goBack()
  await validator.expectSwitchedNetworkOnHeaderButton(networkName)

  await appPage.page.reload()
  await validator.expectToBeConnected('bip122')
  await validator.expectSwitchedNetworkOnHeaderButton(networkName)
})
