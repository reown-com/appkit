import { createWeb3Modal, defaultConfig } from '@web3modal/ethers-5'

// @ts-expect-error 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const chains = [1, 42161]

// 3. Create modal
const modal = createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata: {
      name: 'Web3Modal',
      description: 'Web3Modal Laboratory',
      url: 'https://web3modal.com',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    },
    coinbaseDefaultChainId: 1,
    coinbaseRpcUrl: 'https://cloudflare-eth.com'
  }),
  projectId,
  chains,
  themeMode: 'light'
})

// 4. Trigger modal programaticaly
const openConnectModalBtn = document.getElementById('open-connect-modal')
const openNetworkModalBtn = document.getElementById('open-network-modal')

openConnectModalBtn.addEventListener('click', () => modal.open())
openNetworkModalBtn.addEventListener('click', () => modal.open({ view: 'Networks' }))

// 5. Alternatively use w3m component buttons (see index.html)
