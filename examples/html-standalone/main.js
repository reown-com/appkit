import { SignClient } from '@walletconnect/sign-client'
import { Web3Modal } from '@web3modal/standalone'

// 0. Define ui elements
const connectButton = document.getElementById('connect-button')

// 1. Define constants
const projectId = '8e6b5ffdcbc9794bf9f4a1952578365b'
const namespaces = {
  eip155: { methods: ['eth_sign'], chains: ['eip155:1'], events: ['accountsChanged'] }
}

// 3. Create modal client
export const web3Modal = new Web3Modal({ projectId, standaloneChains: namespaces.eip155.chains })
export let signClient = undefined

// 4. Initialise clients
async function initialize() {
  try {
    connectButton.disabled = true
    signClient = await SignClient.init({ projectId })
    connectButton.disabled = false
    connectButton.innerText = 'Connect Wallet'
  } catch (err) {
    console.error(err)
  }
}

initialize()

// 5. Create connection handler
connectButton.addEventListener('click', async () => {
  try {
    if (signClient) {
      const { uri, approval } = await signClient.connect({ requiredNamespaces: namespaces })
      if (uri) {
        await web3Modal.openModal({ uri })
        await approval()
        web3Modal.closeModal()
      }
    }
  } catch (err) {
    console.error(err)
  }
})
