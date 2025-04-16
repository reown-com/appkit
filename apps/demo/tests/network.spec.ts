import { test } from '@playwright/test'

import { NETWORK_OPTIONS } from '@/lib/constants'

import { DemoPage } from './pages/DemoPage'

let demoPage: DemoPage

test.describe.configure({ mode: 'serial' })

const evmNetworks = NETWORK_OPTIONS.filter(n => n.namespace === 'eip155').map(n => n.network)
const solanaNetworks = NETWORK_OPTIONS.filter(n => n.namespace === 'solana').map(n => n.network)

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
test('Disable chain with chain option', async ({}) => {
  // Open networks page on AppKit
  await demoPage.openNetworks()

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
test('Disable chain with network option', async ({}) => {
  // Open networks page on AppKit
  await demoPage.openNetworks()

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
test('Refresh page keeps state', async ({}) => {
  // Refresh the page
  await demoPage.page.reload()

  // Open networks again after refresh
  await demoPage.openNetworks()

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
