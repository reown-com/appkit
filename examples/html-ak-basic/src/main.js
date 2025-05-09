import base58 from 'bs58'

import { createAppKit } from '@reown/appkit/core'
import { bitcoin, mainnet, polygon, solana } from '@reown/appkit/networks'

// Get projectId
export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

const networks = [mainnet, polygon, solana, bitcoin]
// Instantiate AppKit
const modal = createAppKit({
  adapters: [],
  networks,
  projectId,
  themeMode: 'light',
  features: {
    analytics: true
  },
  metadata: {
    name: 'AppKit HTML Example',
    description: 'AppKit HTML Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

// State objects
let accountState = {}
let networkState = {}
let appKitState = {}
let themeState = { themeMode: 'light', themeVariables: {} }
let providers = { eip155: null, solana: null, bip122: null, polkadot: null }
let events = {}
let walletInfo = {}

// Helper function to update theme
const updateTheme = theme => {
  const themeMode = theme.themeMode

  document.documentElement.setAttribute('data-theme', themeMode)
  document.getElementById('themeState').textContent = JSON.stringify(theme, null, 2)
  document.body.className = themeMode

  themeState = theme

  // Update logo based on theme
  const reownLogo = document.getElementById('reown-logo')
  if (reownLogo) {
    reownLogo.src = themeMode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'
  }
}

// Subscribe to state changes
modal.subscribeAccount(state => {
  accountState = state
  document.getElementById('accountState').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeNetwork(state => {
  networkState = state
  document.getElementById('networkState').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeState(state => {
  appKitState = state
  document.getElementById('appKitState').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeTheme(state => {
  themeState = state
  updateTheme(state)
})

modal.subscribeEvents(state => {
  events = state
  document.getElementById('events').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeWalletInfo(state => {
  walletInfo = state
  document.getElementById('walletInfo').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeProviders(state => {
  providers = state
})

// Button event listeners
document.getElementById('open-modal')?.addEventListener('click', () => {
  modal.open()
})

document.getElementById('disconnect')?.addEventListener('click', () => {
  modal.disconnect()
})

document.getElementById('switch-to-ethereum')?.addEventListener('click', () => {
  modal.switchNetwork(mainnet)
})

document.getElementById('toggle-theme')?.addEventListener('click', () => {
  const newTheme = themeState.themeMode === 'dark' ? 'light' : 'dark'
  modal.setThemeMode(newTheme)
  themeState = { ...themeState, themeMode: newTheme }
  updateTheme(themeState)
})

document.getElementById('switch-network-eth')?.addEventListener('click', network => {
  modal.switchNetwork(mainnet)
})

document.getElementById('switch-network-polygon')?.addEventListener('click', network => {
  modal.switchNetwork(polygon)
})

document.getElementById('switch-network-solana')?.addEventListener('click', network => {
  modal.switchNetwork(solana)
})

document.getElementById('switch-network-bitcoin')?.addEventListener('click', network => {
  modal.switchNetwork(bitcoin)
})

document.getElementById('sign-message')?.addEventListener('click', async () => {
  if (!accountState.address) {
    await modal.open()
    return
  }
  signMessage()
})

async function getPayload() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = {
    solana: {
      method: 'solana_signMessage',
      params: {
        message: base58.encode(new TextEncoder().encode('Hello Appkit!')),
        pubkey: accountState.address
      }
    },
    eip155: {
      method: 'personal_sign',
      params: ['Hello AppKit!', accountState.address]
    },
    bip122: {
      method: 'signMessage',
      params: {
        message: 'Hello AppKit!',
        account: accountState.address
      }
    },
    polkadot: {
      method: 'polkadot_signMessage',
      params: {
        transactionPayload: {
          specVersion: '0x00002468',
          transactionVersion: '0x0000000e',
          address: `${accountState.address}`,
          blockHash: '0x554d682a74099d05e8b7852d19c93b527b5fae1e9e1969f6e1b82a2f09a14cc9',
          blockNumber: '0x00cb539c',
          era: '0xc501',
          genesisHash: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
          method: '0x0001784920616d207369676e696e672074686973207472616e73616374696f6e21',
          nonce: '0x00000000',
          signedExtensions: [
            'CheckNonZeroSender',
            'CheckSpecVersion',
            'CheckTxVersion',
            'CheckGenesis',
            'CheckMortality',
            'CheckNonce',
            'CheckWeight',
            'ChargeTransactionPayment'
          ],
          tip: '0x00000000000000000000000000000000',
          version: 4
        },
        address: accountState.address
      }
    }
  }

  const payload = map[networkState?.caipNetwork?.chainNamespace || '']

  return payload
}

async function signMessage() {
  const walletProvider = providers[networkState?.caipNetwork.chainNamespace]
  try {
    if (!walletProvider || !accountState.address) {
      throw Error('User is disconnected')
    }

    const payload = await getPayload()

    if (!payload) {
      throw Error('Chain not supported by laboratory')
    }
    const signature = await walletProvider.request(
      payload,
      networkState?.caipNetwork?.caipNetworkId
    )

    console.log({
      title: 'Signed successfully',
      description: signature
    })
  } catch (error) {
    console.error({
      title: 'Error signing message',
      description: error.message
    })
  }
}

// Set initial theme and UI state
updateTheme(themeState)
