import { Button, Card, Divider, Modal, Spinner, Text } from '@nextui-org/react'
import SignClient from '@walletconnect/sign-client'
import { Web3Modal } from '@web3modal/standalone'
import { useEffect, useState } from 'react'
import { getProjectId, getTheme } from '../utilities/EnvUtil'

const projectId = getProjectId()
const web3Modal = new Web3Modal({
  projectId,
  walletConnectVersion: 2,
  themeMode: getTheme()
})

export default function v2StandalonePage() {
  const [signClient, setSignClient] = useState<SignClient | undefined>(undefined)
  const [clientId, setClientId] = useState<string | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)

  async function onInitializeSignClient() {
    const client = await SignClient.init({ projectId: process.env.NEXT_PUBLIC_PROJECT_ID })
    const signClientId = await client.core.crypto.getClientId()
    setClientId(signClientId)
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
          setModalOpen(true)
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
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Button shadow color="warning" onClick={onOpenModal}>
            Connect Wallet
          </Button>

          <Divider style={{ margin: '20px 0' }} />

          <Text h5>Client ID</Text>
          <Text size="$xs" color="grey">
            {clientId?.split('did:key:')[1]}
          </Text>
        </Card.Body>
      </Card>

      <Modal closeButton blur open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>
          <Text h3>Success</Text>
        </Modal.Header>
        <Modal.Body>
          <Text color="grey">This is it for this example</Text>
        </Modal.Body>
      </Modal>
    </>
  ) : (
    <Spinner />
  )
}
