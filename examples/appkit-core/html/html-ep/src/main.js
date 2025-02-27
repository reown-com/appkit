import { EthereumProvider } from '@walletconnect/ethereum-provider'

// Constants
const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'

// State
let provider
let account
let balance
let network

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
  // Initialize provider
  provider = await EthereumProvider.init({
    projectId,
    chains: [1, 137],
    optionalChains: [1, 137],
    showQrModal: true,
    qrModalOptions: {
      themeMode: 'light'
    },
    metadata: {
      name: 'AppKit HTML Ethereum Provider Example',
      description: 'AppKit HTML Ethereum Provider Example',
      url: 'https://reown.com/appkit',
      icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
    }
  })

  // Set initial state
  account = provider?.accounts?.[0]
  network = provider?.chainId?.toString()

  // Event listeners
  provider.on('chainChanged', chainId => {
    network = chainId
    updateDom()
  })

  provider.on('accountsChanged', accounts => {
    account = accounts[0]
    updateDom()
  })

  // Button handlers
  document.getElementById('connect')?.addEventListener('click', async () => {
    await provider.connect()
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
  updateDom()
}

// Initialize when DOM is ready
initializeApp()
