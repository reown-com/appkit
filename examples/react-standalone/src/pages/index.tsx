import SignClient from '@walletconnect/sign-client'
import { ConfigCtrl, ModalCtrl } from '@web3modal/core'
import '@web3modal/ui'
import type { W3mModal } from '@web3modal/ui'
import { useEffect, useState } from 'react'

// 1. Get projectID at https://cloud.walletconnect.com
if (!process.env.NEXT_PUBLIC_PROJECT_ID)
  throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')

// 2. Configure sign client
let signClient: SignClient | undefined = undefined
const namespaces = {
  eip155: {
    methods: ['eth_sign'],
    chains: ['eip155:1'],
    events: ['accountsChanged']
  }
}
async function configureSignClient() {
  signClient = await SignClient.init({ projectId: process.env.NEXT_PUBLIC_PROJECT_ID })
}

// 3. Configure web3modal
ConfigCtrl.setConfig({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  theme: 'dark' as const,
  accentColor: 'default' as const,
  standaloneChains: namespaces.eip155.chains
})

// 4. Manage manual connection
export default function HomePage() {
  const [initializing, setInitializing] = useState(true)

  async function onOpenModal() {
    if (signClient) {
      const { uri, approval } = await signClient.connect({ requiredNamespaces: namespaces })
      if (uri) {
        ModalCtrl.open(uri)
        await approval()
        ModalCtrl.close()
      }
    }
  }

  async function onInitialize() {
    await configureSignClient()
    setInitializing(false)
  }

  useEffect(() => {
    onInitialize()
  }, [])

  return (
    <>
      {initializing ? 'Initializing...' : <button onClick={onOpenModal}>Connect Wallet</button>}
      <w3m-modal></w3m-modal>
    </>
  )
}

// 5. Let typescript know about custom w3m-modal dom / webcomponent element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-modal': Partial<W3mModal>
    }
  }
}
