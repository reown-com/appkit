import { test } from '@playwright/test'

import { ConstantsUtil } from '@reown/appkit-common'

import { NETWORK_OPTIONS } from '@/lib/networks'

import { DemoPage } from './pages/DemoPage'

// eslint-disable-next-line init-declarations
let demoPage: DemoPage

test.describe.configure({ mode: 'serial' })

const evmNetworks = NETWORK_OPTIONS.filter(n => n.namespace === ConstantsUtil.CHAIN.EVM).map(
  n => n.network
)
const solanaNetworks = NETWORK_OPTIONS.filter(n => n.namespace === ConstantsUtil.CHAIN.SOLANA).map(
  n => n.network
)

const tronNetworks = NETWORK_OPTIONS.filter(n => n.namespace === ConstantsUtil.CHAIN.TRON).map(
  n => n.network
)
const tonNetworks = NETWORK_OPTIONS.filter(n => n.namespace === ConstantsUtil.CHAIN.TON).map(
  n => n.network
)

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const browserPage = await context.newPage()

  demoPage = new DemoPage(browserPage)

  await demoPage.load()
})

test.afterAll(async () => {
  await demoPage.page.close()
})

// Test case 1: Disable chain with chain option
test('it should disable chain with chain option as expected', async () => {
  // Open networks page on AppKit
  await demoPage.openNetworksWithHook()

  // Make sure the chain options are enabled
  await demoPage.verifyChainOptionEnabled('eip155', true)
  await demoPage.verifyNetworkAvailableOnAppKit('Ethereum', true)

  // Disable the EVM chain
  await demoPage.disableChainOption('eip155')

  // Make sure the EVM networks are not visible on AppKit
  await demoPage.verifyChainOptionEnabled('eip155', false)

  evmNetworks.forEach(async network => {
    await demoPage.verifyNetworkAvailableOnAppKit(network.name, false)
  })
})

// Test case 2: Disable chain with network option
test('it should disable chain with network option as expected', async () => {
  // Open networks page on AppKit
  await demoPage.openNetworksWithHook()

  // Make sure the network options are enabled
  await demoPage.verifyNetworkOptionEnabled('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', true)
  await demoPage.verifyNetworkAvailableOnAppKit('Solana', true)

  // Disable the Solana network
  await demoPage.disableNetworkOption('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')

  // Make sure the Solana chain is still enabled
  await demoPage.verifyChainOptionEnabled('solana', true)
  await demoPage.verifyNetworkAvailableOnAppKit('Solana', false)

  // Disable the Solana Devnet network
  await demoPage.disableNetworkOption('EtWTRABZaYq6iMfeYKouRu166VU2xqa1')

  // Make sure the Solana chain and network options are disabled
  await demoPage.verifyChainOptionEnabled('solana', false)
  solanaNetworks.forEach(async network => {
    await demoPage.verifyNetworkOptionEnabled(network.id, false)
  })

  // Make sure the Solana networks are not visible on AppKit
  await demoPage.verifyNetworkAvailableOnAppKit('Solana', false)
  await demoPage.verifyNetworkAvailableOnAppKit('Solana Devnet', false)
})

// Test case 3: Refresh page keeps state
test('it should refresh page keeps state as expected', async () => {
  // Refresh the page
  await demoPage.page.reload()

  // Open networks again after refresh
  await demoPage.openNetworksWithHook()

  // Verify state remains the same after refresh
  await demoPage.verifyChainOptionEnabled('eip155', false)
  await demoPage.verifyChainOptionEnabled('solana', false)

  solanaNetworks.forEach(async network => {
    await demoPage.verifyNetworkOptionEnabled(network.id, false)
  })

  // Verify networks are still not visible
  await demoPage.verifyNetworkAvailableOnAppKit('Ethereum', false)

  evmNetworks.forEach(async network => {
    await demoPage.verifyNetworkAvailableOnAppKit(network.name, false)
  })
})

// Test case 4: Tron and TON are enabled by default and Tron can be disabled with chain option
test('it should enable Tron and TON by default and disable Tron with chain option', async () => {
  await demoPage.openNetworksWithHook()

  await demoPage.verifyChainOptionEnabled('tron', true)
  await demoPage.verifyChainOptionEnabled('ton', true)
  await demoPage.verifyNetworkAvailableOnAppKit('TRON', true)
  await demoPage.verifyNetworkAvailableOnAppKit('TON', true)
  await demoPage.verifyNetworkAvailableOnAppKit('TON Testnet', true)

  await demoPage.disableChainOption('tron')

  await demoPage.verifyChainOptionEnabled('tron', false)
  await Promise.all(tronNetworks.map(n => demoPage.verifyNetworkOptionEnabled(n.id, false)))
  await demoPage.verifyNetworkAvailableOnAppKit('TRON', false)
  await demoPage.verifyChainOptionEnabled('ton', true)
})

// Test case 5: Disabling every TON network disables the chain and the chain option brings both back
test('it should disable TON with network options and enable it with chain option', async () => {
  await demoPage.openNetworksWithHook()

  await demoPage.disableNetworkOption('-3')
  await demoPage.verifyChainOptionEnabled('ton', true)
  await demoPage.verifyNetworkAvailableOnAppKit('TON Testnet', false)
  await demoPage.verifyNetworkAvailableOnAppKit('TON', true)

  await demoPage.disableNetworkOption('-239')
  await demoPage.verifyChainOptionEnabled('ton', false)
  await demoPage.verifyNetworkAvailableOnAppKit('TON', false)

  await demoPage.page.getByTestId('chain-option-ton').click()

  await demoPage.verifyChainOptionEnabled('ton', true)
  await Promise.all(tonNetworks.map(n => demoPage.verifyNetworkOptionEnabled(n.id, true)))
  await demoPage.verifyNetworkAvailableOnAppKit('TON', true)
  await demoPage.verifyNetworkAvailableOnAppKit('TON Testnet', true)
})

// Test case 6: Tron and TON state survives a refresh
test('it should keep Tron disabled and TON enabled after refresh', async () => {
  await demoPage.page.reload()
  await demoPage.openNetworksWithHook()

  await demoPage.verifyChainOptionEnabled('tron', false)
  await demoPage.verifyChainOptionEnabled('ton', true)
  await Promise.all(tonNetworks.map(n => demoPage.verifyNetworkOptionEnabled(n.id, true)))
  await demoPage.verifyNetworkAvailableOnAppKit('TRON', false)
  await demoPage.verifyNetworkAvailableOnAppKit('TON', true)
})

// Test case 7: A shared link created before Tron and TON existed keeps them off and lets the user enable them
test('it should keep Tron and TON off for a link without them and allow enabling Tron', async () => {
  const linkWithoutTronAndTon = btoa(
    JSON.stringify({
      enabledChains: ['eip155', 'solana', 'bip122'],
      enabledNetworks: [1, '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', '000000000019d6689c085ae165831e93']
    })
  )

  await demoPage.page.goto(`/?config=${linkWithoutTronAndTon}`)
  await demoPage.openNetworksWithHook()

  await demoPage.verifyChainOptionEnabled('tron', false)
  await demoPage.verifyChainOptionEnabled('ton', false)
  await demoPage.verifyNetworkAvailableOnAppKit('TRON', false)

  await demoPage.page.getByTestId('chain-option-tron').click()

  await demoPage.verifyChainOptionEnabled('tron', true)
  await Promise.all(tronNetworks.map(n => demoPage.verifyNetworkOptionEnabled(n.id, true)))
  await demoPage.verifyNetworkAvailableOnAppKit('TRON', true)
})
