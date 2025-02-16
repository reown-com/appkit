import UniversalProvider from '@walletconnect/universal-provider'

import { createAppKit } from '@reown/appkit'
import { mainnet, solana } from '@reown/appkit/networks'

// Constants
const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'

const OPTIONAL_NAMESPACES = {
  eip155: {
    methods: [
      'eth_sendTransaction',
      'eth_signTransaction',
      'eth_sign',
      'personal_sign',
      'eth_signTypedData'
    ],
    chains: ['eip155:1'],
    events: ['chainChanged', 'accountsChanged']
  }
}

// State
let provider
let modal
let account
let network
let balance

function updateDom() {
  const elements = {
    connect: document.getElementById('connect'),
    disconnect: document.getElementById('disconnect'),
    getBalance: document.getElementById('get-balance'),
    session: document.getElementById('session'),
    account: document.getElementById('account'),
    balance: document.getElementById('balance'),
    network: document.getElementById('network')
  }

  const hasSession = provider?.session && Object.keys(provider.session).length > 0

  // Update button visibility
  elements.connect.style.display = hasSession ? 'none' : 'block'
  elements.disconnect.style.display = hasSession ? 'block' : 'none'
  elements.getBalance.style.display = hasSession ? 'block' : 'none'

  // Update state displays
  if (elements.session) elements.session.textContent = JSON.stringify(provider.session)
  if (elements.account) elements.account.textContent = JSON.stringify(account)
  if (elements.balance) elements.balance.textContent = JSON.stringify(balance)
  if (elements.network) elements.network.textContent = JSON.stringify(network)
}

function clearState() {
  account = undefined
  balance = undefined
  network = undefined
}

async function initializeApp() {
  // Initialize providers
  provider = await UniversalProvider.init({ projectId })

  modal = createAppKit({
    projectId,
    networks: [mainnet, solana],
    universalProvider: provider
  })

  // Event listeners
  provider.on('chainChanged', chainId => {
    network = chainId
    updateDom()
  })

  provider.on('accountsChanged', accounts => {
    account = accounts[0]
    updateDom()
  })

  provider.on('connect', async session => {
    await modal.close()
    account = session?.session?.namespaces?.eip155?.accounts?.[0]?.split(':')[2]
    network = session?.session?.namespaces?.eip155?.chains?.[0]
    updateDom()
  })

  provider.on('display_uri', uri => {
    modal.open({ uri, view: 'ConnectingWalletConnectBasic' })
  })

  // Button handlers
  document.getElementById('connect')?.addEventListener('click', async () => {
    await provider.connect({ optionalNamespaces: OPTIONAL_NAMESPACES })
    updateDom()
  })

  document.getElementById('disconnect')?.addEventListener('click', async () => {
    await provider.disconnect()
    clearState()
    updateDom()
  })

  document.getElementById('get-balance')?.addEventListener('click', async () => {
    balance = await provider.request({
      method: 'eth_getBalance',
      params: [account, 'latest']
    })
    updateDom()
  })

  // Initialize DOM
  account = provider?.session?.namespaces?.eip155?.accounts?.[0]?.split(':')[2]
  network = provider?.session?.namespaces?.eip155?.chains?.[0]
  updateDom()
}

initializeApp()
