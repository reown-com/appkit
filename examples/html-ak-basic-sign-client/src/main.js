import { SignClient } from '@walletconnect/sign-client'

import { createAppKit } from '@reown/appkit'
import { mainnet } from '@reown/appkit/networks'

// Constants
const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'
const REQUIRED_NAMESPACES = {
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

// Initialize clients
let signClient
let modal
let session
let account
let network

async function initialize() {
  signClient = await SignClient.init({ projectId: PROJECT_ID })
  modal = createAppKit({
    projectId: PROJECT_ID,
    networks: [mainnet]
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

  // Update button visibility
  if (session) {
    connect.style.display = 'none'
    disconnect.style.display = 'block'
    signMessage.style.display = 'block'
  } else {
    connect.style.display = 'block'
    disconnect.style.display = 'none'
    signMessage.style.display = 'none'
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
    const { uri, approval } = await signClient.connect({
      requiredNamespaces: REQUIRED_NAMESPACES
    })

    if (uri) {
      modal.open({ uri, view: 'ConnectingWalletConnectBasic' })
      session = await approval()
      account = session?.namespaces['eip155']?.accounts?.[0]?.split(':')[2]
      network = session?.namespaces['eip155']?.chains?.[0]
      modal.close()
    }

    updateDom()
  })

  document.getElementById('disconnect')?.addEventListener('click', async () => {
    await signClient.disconnect({ topic: session.topic })
    clearState()
    updateDom()
  })

  document.getElementById('sign-message')?.addEventListener('click', async () => {
    await signClient.request({
      topic: session.topic,
      chainId: 'eip155:1',
      request: {
        method: 'personal_sign',
        params: [
          '0x7468697320697320612074657374206d65737361676520746f206265207369676e6564',
          account
        ]
      }
    })
  })
}

// Initialize the application
initialize().catch(console.error)
