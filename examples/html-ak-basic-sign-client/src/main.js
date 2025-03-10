import { SignClient } from '@walletconnect/sign-client'
import base58 from 'bs58'

import { createAppKit } from '@reown/appkit/basic'
import { bitcoin, mainnet, polygon, solana } from '@reown/appkit/networks'

// Constants
const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'
const OPTIONAL_NAMESPACES = {
  eip155: {
    methods: [
      'eth_sendTransaction',
      'eth_signTransaction',
      'eth_sign',
      'personal_sign',
      'eth_signTypedData',
      'wallet_switchEthereumChain'
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

// Initialize clients
let signClient
let modal
let session
let account
let network

const networks = [mainnet, polygon, solana, bitcoin]

async function initialize() {
  signClient = await SignClient.init({ projectId: PROJECT_ID })
  modal = createAppKit({
    projectId: PROJECT_ID,
    networks,
    manualWCControl: true
  })

  document.getElementById('toggle-theme')?.addEventListener('click', () => {
    const newTheme = themeState.themeMode === 'dark' ? 'light' : 'dark'
    modal.setThemeMode(newTheme)
    themeState = { ...themeState, themeMode: newTheme }
    updateTheme(newTheme)
  })

  document.getElementById('switch-network-eth')?.addEventListener('click', async () => {
    await modal.switchNetwork(mainnet)
    network = `eip155:${mainnet.id}`

    await signClient.request({
      topic: session.topic,
      chainId: network,
      request: {
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: '0x1'
          }
        ]
      }
    })
    account = session?.namespaces?.eip155?.accounts?.[0]?.split(':')[2]
    updateDom()
  })

  document.getElementById('switch-network-polygon')?.addEventListener('click', async () => {
    await modal.switchNetwork(polygon)
    network = `eip155:${polygon.id}`

    await signClient.request({
      topic: session.topic,
      chainId: network,
      request: {
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: '0x89'
          }
        ]
      }
    })
    account = session?.namespaces?.eip155?.accounts?.[0]?.split(':')[2]
    updateDom()
  })

  document.getElementById('switch-network-solana')?.addEventListener('click', async () => {
    await modal.switchNetwork(solana)
    network = solana.caipNetworkId
    account = session?.namespaces?.solana?.accounts?.[0].split(':')[2]
    updateDom()
  })

  document.getElementById('switch-network-bitcoin')?.addEventListener('click', async () => {
    await modal.switchNetwork(bitcoin)
    network = bitcoin.caipNetworkId
    account = session?.namespaces?.bip122?.accounts?.[0].split(':')[2]
    updateDom()
  })

  // Get last session if exists
  const sessions = signClient.session.getAll()
  const lastSession = sessions[sessions.length - 1]

  // Set initial state
  session = lastSession
  account = lastSession?.namespaces?.eip155?.accounts?.[0]?.split(':')[2]
  network = lastSession?.namespaces?.eip155?.chains?.[0]

  // Event listeners
  signClient.on('session_update', ({ topic, params }) => {
    const { namespaces } = params
    const _session = signClient.session.get(topic)
    session = { ..._session, namespaces }
    updateDom()
  })

  setupEventListeners()
  updateDom()
}

function updateDom() {
  const connect = document.getElementById('connect')
  const disconnect = document.getElementById('disconnect')
  const signMessage = document.getElementById('sign-message')
  const switchToEth = document.getElementById('switch-network-eth')
  const switchToPolygon = document.getElementById('switch-network-polygon')
  const switchToSolana = document.getElementById('switch-network-solana')
  const switchToBitcoin = document.getElementById('switch-network-bitcoin')

  // Update button visibility
  if (session) {
    connect.style.display = 'none'
    disconnect.style.display = 'block'
    signMessage.style.display = 'block'
    switchToEth.style.display = 'block'
    switchToPolygon.style.display = 'block'
    switchToSolana.style.display = 'block'
    switchToBitcoin.style.display = 'block'
  } else {
    connect.style.display = 'block'
    disconnect.style.display = 'none'
    signMessage.style.display = 'none'
    switchToEth.style.display = 'none'
    switchToPolygon.style.display = 'none'
    switchToSolana.style.display = 'none'
    switchToBitcoin.style.display = 'none'
  }

  // Update state displays
  const elements = {
    session: document.getElementById('session'),
    account: document.getElementById('account'),
    network: document.getElementById('network')
  }

  if (elements.session) elements.session.textContent = JSON.stringify(session)
  if (elements.account) elements.account.textContent = JSON.stringify(account)
  if (elements.network) elements.network.textContent = JSON.stringify(network)
}

function clearState() {
  session = undefined
  account = undefined
  network = undefined
}

function setupEventListeners() {
  document.getElementById('connect')?.addEventListener('click', async () => {
    setLoading(true)
    const { uri, approval } = await signClient.connect({
      optionalNamespaces: OPTIONAL_NAMESPACES
    })

    if (uri) {
      modal.open({ uri })
      session = await approval()
      account = session?.namespaces['eip155']?.accounts?.[0]?.split(':')[2]
      network = session?.namespaces['eip155']?.chains?.[0]
      modal.close()
    }
    setLoading(false)
    updateDom()
  })

  document.getElementById('disconnect')?.addEventListener('click', async () => {
    await signClient.disconnect({ topic: session.topic })
    clearState()
    updateDom()
  })

  document.getElementById('sign-message')?.addEventListener('click', signMessage)
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
      params: [account, 'Hello AppKit!']
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
    if (!signClient || !account) {
      throw Error('User is disconnected')
    }

    const payload = await getPayload()

    if (!payload) {
      throw Error('Chain not supported by laboratory')
    }

    const sig = await signClient.request({
      topic: session.topic,
      chainId: network,
      request: payload
    })

    console.log({
      title: 'Signed successfully',
      description: sig
    })
  } catch (error) {
    console.error({
      title: 'Error signing message',
      description: error.message
    })
  }
}

function setLoading(loading) {
  const connect = document.getElementById('connect')
  connect.textContent = loading ? 'Connecting...' : 'Connect'
  connect.disabled = loading
}

// Initialize the application
initialize().catch(console.error)
