import { Button, Card, Spinner } from '@nextui-org/react'
import SignClient from '@walletconnect/sign-client'
import { Web3Modal } from '@web3modal/standalone'
import { useEffect, useState } from 'react'
import { getProjectId } from '../utilities/EnvUtil'

const projectId = getProjectId()
const web3Modal = new Web3Modal({ projectId, themeColor: 'orange' })

export default function v2StandalonePage() {
  const [signClient, setSignClient] = useState<SignClient | undefined>(undefined)

  async function onInitializeSignClient() {
    const client = await SignClient.init({ projectId: process.env.NEXT_PUBLIC_PROJECT_ID })
    setSignClient(client)
  }

  async function onOpenModal() {
    if (signClient) {
      const namespaces = {
        eip155: {
          methods: ['eth_sign'],
          chains: ['eip155:1'],
          events: ['accountsChanged']
        }
      }
      const { uri, approval } = await signClient.connect({ requiredNamespaces: namespaces })
      if (uri) {
        try {
          await web3Modal.openModal({ uri, standaloneChains: namespaces.eip155.chains })
          await approval()
        } finally {
          web3Modal.closeModal()
        }
      }
    }
  }

  useEffect(() => {
    onInitializeSignClient()
  }, [])

  return signClient ? (
    <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
      <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '140px' }}>
        <Button shadow color="warning" onClick={onOpenModal}>
          Connect Wallet
        </Button>
      </Card.Body>
    </Card>
  ) : (
    <Spinner />
  )
}
