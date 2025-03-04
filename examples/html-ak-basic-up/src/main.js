import UniversalProvider from '@walletconnect/universal-provider'
import base58 from 'bs58'

import { createAppKit } from '@reown/appkit/basic'
import { bitcoin, mainnet, polygon, solana } from '@reown/appkit/networks'

// Constants
const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'

const networks = [mainnet, polygon, solana, bitcoin]

const OPTIONAL_NAMESPACES = {
  eip155: {
    methods: [
      'eth_sendTransaction',
      'eth_signTransaction',
      'eth_sign',
      'personal_sign',
      'eth_signTypedData'
    ],
    chains: ['eip155:1', 'eip155:137'],
    events: ['chainChanged', 'accountsChanged']
  },
  solana: {
    methods: ['solana_signMessage'],
    chains: [solana.caipNetworkId],
    events: ['chainChanged', 'accountsChanged']
  },
  bip122: {
    methods: ['signMessage'],
    chains: [bitcoin.caipNetworkId],
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
    network: document.getElementById('network'),
    switchToEth: document.getElementById('switch-network-eth'),
    switchToPolygon: document.getElementById('switch-network-polygon'),
    switchToSolana: document.getElementById('switch-network-solana'),
    switchToBitcoin: document.getElementById('switch-network-bitcoin'),
    signMessage: document.getElementById('sign-message')
  }

  const hasSession = provider?.session && Object.keys(provider.session).length > 0
  // Update button visibility
  elements.connect.style.display = hasSession ? 'none' : 'block'
  elements.disconnect.style.display = hasSession ? 'block' : 'none'
  elements.getBalance.style.display = hasSession ? 'block' : 'none'
  elements.switchToEth.style.display = hasSession ? 'block' : 'none'
  elements.switchToPolygon.style.display = hasSession ? 'block' : 'none'
  elements.switchToSolana.style.display = hasSession ? 'block' : 'none'
  elements.switchToBitcoin.style.display = hasSession ? 'block' : 'none'
  elements.signMessage.style.display = hasSession ? 'block' : 'none'

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
    networks,
    universalProvider: provider,
    manualWCControl: true
  })

  // Event listeners
  provider.on('chainChanged', chainId => {
    network = chainId

    updateDom()
  })

  provider.on('disconnect', updateDom)

  provider.on('accountsChanged', accounts => {
    account = accounts[0]
    updateDom()
  })

  provider.on('connect', async session => {
    await modal.close()
    account = session?.session?.namespaces?.eip155?.accounts?.[0]?.split(':')[2]
    const chain = session?.session?.namespaces?.eip155?.chains?.[0]

    if (!isNaN(Number(chain))) {
      network = `eip155:${chain}`
    } else {
      network = chain
    }

    updateDom()
  })

  // Button handlers
  document.getElementById('connect')?.addEventListener('click', async () => {
    setLoading(true)
    await modal.open()
    modal.subscribeEvents(({ data }) => {
      if (data.event === 'MODAL_CLOSE') {
        setLoading(false)
      }
    })
    await provider.connect({ optionalNamespaces: OPTIONAL_NAMESPACES })
    updateDom()
    setLoading(false)
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

  document.getElementById('switch-network-eth')?.addEventListener('click', async () => {
    modal.switchNetwork(mainnet)
    network = 'eip155:1'
    account = provider?.session?.namespaces?.eip155?.accounts?.[0]?.split(':')[2]
    localStorage.setItem('active_network', network)
    updateDom()
  })

  document.getElementById('switch-network-polygon')?.addEventListener('click', async () => {
    modal.switchNetwork(polygon)
    network = 'eip155:137'
    account = provider?.session?.namespaces?.eip155?.accounts?.[0]?.split(':')[2]
    localStorage.setItem('active_network', network)
    updateDom()
  })

  document.getElementById('switch-network-solana')?.addEventListener('click', async () => {
    modal.switchNetwork(solana)
    network = solana.caipNetworkId
    account = provider?.session?.namespaces?.solana?.accounts?.[0].split(':')[2]
    localStorage.setItem('active_network', network)
    updateDom()
  })

  document.getElementById('switch-network-bitcoin')?.addEventListener('click', async () => {
    modal.switchNetwork(bitcoin)
    network = bitcoin.caipNetworkId
    account = provider?.session?.namespaces?.bip122?.accounts?.[0].split(':')[2]
    localStorage.setItem('active_network', network)
    updateDom()
  })

  document.getElementById('sign-message')?.addEventListener('click', signMessage)

  // Initialize DOM
  account = provider?.session?.namespaces?.eip155?.accounts?.[0]?.split(':')[2]
  network =
    localStorage.getItem('active_network') || provider?.session?.namespaces?.eip155?.chains?.[0]
  updateDom()
}

async function getPayload() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = {
    solana: {
      method: 'solana_signMessage',
      params: {
        message: base58.encode(new TextEncoder().encode('Hello Appkit!')),
        pubkey: account
      }
    },
    eip155: {
      method: 'personal_sign',
      params: ['Hello AppKit!', account]
    },
    bip122: {
      method: 'signMessage',
      params: {
        message: 'Hello AppKit!',
        account: account
      }
    },
    polkadot: {
      method: 'polkadot_signMessage',
      params: {
        transactionPayload: {
          specVersion: '0x00002468',
          transactionVersion: '0x0000000e',
          address: `${account}`,
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
        address: account
      }
    }
  }

  const [namespace] = network.split(':')
  const payload = map[namespace || '']

  return payload
}

async function signMessage() {
  try {
    if (!provider || !account) {
      throw Error('User is disconnected')
    }

    const payload = await getPayload()

    if (!payload) {
      throw Error('Chain not supported by laboratory')
    }

    const signature = await provider.request(payload, network)

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

function setLoading(isLoading) {
  const connect = document.getElementById('connect')
  connect.textContent = isLoading ? 'Connecting...' : 'Connect'
  connect.disabled = isLoading
}

initializeApp()
