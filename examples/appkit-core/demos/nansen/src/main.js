import UniversalProvider from '@walletconnect/universal-provider'
import base58 from 'bs58'
import { formatDirectSignDoc, stringifySignDocValues } from 'cosmos-wallet'

import { createAppKit } from '@reown/appkit/basic'
import { bitcoin, defineChain, mainnet, polygon, solana } from '@reown/appkit/networks'

// Constants
const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'

const polkadot = defineChain({
  id: '91b171bb158e2d3848fa23a9f1c25182',
  name: 'Polkadot',
  nativeCurrency: { name: 'Polkadot', symbol: 'DOT', decimals: 10 },
  rpcUrls: {
    default: { http: ['https://rpc.polkadot.io'], wss: 'wss://rpc.polkadot.io' }
  },
  blockExplorers: { default: { name: 'Polkadot Explorer', url: 'https://polkadot.js.org/apps/' } },
  chainNamespace: 'polkadot',
  caipNetworkId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182'
})

// const sui = defineChain({
//   id: 'mainnet',
//   name: 'Sui',
//   nativeCurrency: { name: 'Sui', symbol: 'SUI', decimals: 9 },
//   rpcUrls: {
//     default: { http: ['https://sui-rpc.publicnode.com'] }
//   },
//   blockExplorers: { default: { name: 'Sui Explorer', url: 'https://suiexplorer.com/' } },
//   testnet: false,
//   chainNamespace: 'sui',
//   caipNetworkId: 'sui:mainnet'
// })
const cosmos = defineChain({
  id: 'cosmoshub-3',
  name: 'Cosmos',
  nativeCurrency: { name: 'Cosmos', symbol: 'ATOM', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://cosmos-rpc.publicnode.com:443'] }
  },
  blockExplorers: { default: { name: 'Sui Explorer', url: 'https://suiexplorer.com/' } },
  testnet: false,
  chainNamespace: 'cosmos',
  caipNetworkId: 'cosmos:cosmoshub-4'
})

const networks = [mainnet, polygon, solana, bitcoin, cosmos, polkadot]

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
  },
  cosmos: {
    methods: ['cosmos_signDirect', 'cosmos_signAmino'],
    chains: [`cosmos:cosmoshub-4`, `cosmos:cosmoshub-3`],
    events: ['chainChanged', 'accountsChanged']
  },
  polkadot: {
    methods: ['polkadot_signMessage'],
    chains: [polkadot.caipNetworkId],
    events: ['chainChanged', 'accountsChanged']
  }
  // sui: {}
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
    switchToCosmos: document.getElementById('switch-network-cosmos'),
    switchToPolkadot: document.getElementById('switch-network-polkadot'),
    signMessage: document.getElementById('sign-message')
  }

  const hasSession = provider?.session && Object.keys(provider.session).length > 0
  // Only toggle main action buttons
  elements.connect.style.display = hasSession ? 'none' : 'block'
  elements.disconnect.style.display = hasSession ? 'block' : 'none'
  elements.getBalance.style.display = hasSession ? 'block' : 'none'
  elements.signMessage.style.display = hasSession ? 'block' : 'none'

  // Leave network buttons visible regardless of connection state

  // Update state displays
  if (elements.session) elements.session.textContent = JSON.stringify(provider.session)
  if (elements.account) elements.account.textContent = JSON.stringify(account)
  if (elements.balance) elements.balance.textContent = JSON.stringify(balance)
  if (elements.network) elements.network.textContent = JSON.stringify(network)

  updateNetworkButtons() // Update disabled state on network buttons
}

function updateNetworkButtons() {
  // Map chain IDs to the corresponding button elements.
  const networksMap = {
    'eip155:1': document.getElementById('switch-network-eth'),
    'eip155:137': document.getElementById('switch-network-polygon'),
    [solana.caipNetworkId]: document.getElementById('switch-network-solana'),
    [bitcoin.caipNetworkId]: document.getElementById('switch-network-bitcoin'),
    [cosmos.caipNetworkId]: document.getElementById('switch-network-cosmos'),
    [polkadot.caipNetworkId]: document.getElementById('switch-network-polkadot')
  }
  // Map each chain ID to its namespace key.
  const chainNamespaceMapping = {
    'eip155:1': 'eip155',
    'eip155:137': 'eip155',
    [solana.caipNetworkId]: 'solana',
    [bitcoin.caipNetworkId]: 'bip122',
    [cosmos.caipNetworkId]: 'cosmos',
    [polkadot.caipNetworkId]: 'polkadot'
  }

  if (provider && provider.session && provider.session.namespaces) {
    const approvedNamespaces = provider.session.namespaces
    for (const chainId in networksMap) {
      const button = networksMap[chainId]
      const ns = chainNamespaceMapping[chainId]
      // Enable button only if the corresponding namespace is approved.
      button.disabled = !approvedNamespaces[ns]
    }
  } else {
    // If not connected, keep all network buttons enabled (for pre-selection).
    Object.values(networksMap).forEach(button => {
      button.disabled = false
    })
  }
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
    await modal.disconnect()
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
    console.log('>> network:', network)
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
    console.log(session)

    modal.switchNetwork(bitcoin)
    network = bitcoin.caipNetworkId
    account = provider?.session?.namespaces?.bip122?.accounts?.[0].split(':')[2]
    localStorage.setItem('active_network', network)
    updateDom()
  })

  document.getElementById('switch-network-cosmos')?.addEventListener('click', async () => {
    console.log(session)

    modal.switchNetwork(cosmos)
    network = cosmos.caipNetworkId
    account = provider?.session?.namespaces?.cosmos?.accounts?.[0].split(':')[2]
    localStorage.setItem('active_network', network)
    updateDom()
  })

  document.getElementById('switch-network-polkadot')?.addEventListener('click', async () => {
    console.log(session)

    modal.switchNetwork(polkadot)
    network = polkadot.caipNetworkId
    account = provider?.session?.namespaces?.polkadot?.accounts?.[0].split(':')[2]
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
    },
    cosmos: {
      method: 'cosmos_signDirect',
      params: {
        signerAddress: account,
        signDoc: stringifySignDocValues(
          formatDirectSignDoc(
            [{ amount: '2000', denom: 'ucosm' }],
            'AgSEjOuOr991QlHCORRmdE5ahVKeyBrmtgoYepCpQGOW',
            200000,
            1,
            1,
            '0a90010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e6412700a2d636f736d6f7331706b707472653766646b6c366766727a6c65736a6a766878686c63337234676d6d6b38727336122d636f736d6f7331717970717870713971637273737a673270767871367273307a716733797963356c7a763778751a100a0575636f736d120731323334353637',
            '0a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a21034f04181eeba35391b858633a765c4a0c189697b40d216354d50890d350c7029012040a020801180112130a0d0a0575636f736d12043230303010c09a0c',
            'cosmoshub-4'
          )
        )
      }
    }
  }
  console.log('>> network:', network)
  const [namespace] = network.split(':')
  console.log('>> Namespace', namespace)
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
    console.trace('Error signing message', error)
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
