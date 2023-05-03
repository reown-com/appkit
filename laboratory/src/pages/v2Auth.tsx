import { Button, Card, Divider, Modal, Spinner, Text } from '@nextui-org/react'
import AuthClient, { generateNonce } from '@walletconnect/auth-client'
import { Web3Modal } from '@web3modal/standalone'
import { useEffect, useState } from 'react'
import { getProjectId, getTheme } from '../utilities/EnvUtil'

const projectId = getProjectId()
const web3Modal = new Web3Modal({
  projectId,
  walletConnectVersion: 2,
  themeMode: getTheme(),
  standaloneChains: ['eip155:1']
})

export default function v2AuthPage() {
  const [authClient, setAuthCLient] = useState<AuthClient | undefined>(undefined)
  const [clientId, setClientId] = useState<string | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const [response, setResponse] = useState('')

  async function onInitializeAuthClient() {
    const client = await AuthClient.init({
      projectId,
      metadata: {
        name: 'Web3Lab',
        description: 'Web3Modal Laboratory',
        url: 'https://lab.web3modal.com',
        icons: ['https://lab.web3modal.com/favicon.ico']
      }
    })
    client.on('auth_response', ({ params }) => {
      // @ts-expect-error Exists
      setResponse(JSON.stringify(params.result?.s, null, 2))
      setModalOpen(true)
    })
    const signClientId = await client.core.crypto.getClientId()
    setClientId(signClientId)
    setAuthCLient(client)
  }

  async function onOpenModal() {
    if (authClient) {
      try {
        const { uri } = await authClient.request({
          aud: window.location.href,
          domain: window.location.hostname.split('.').slice(-2).join('.'),
          chainId: 'eip155:1',
          type: 'eip4361',
          nonce: generateNonce(),
          statement: 'Sign in with wallet.'
        })
        if (uri) {
          await web3Modal.openModal({ uri })
        }
      } catch {
        web3Modal.closeModal()
      }
    }
  }

  useEffect(() => {
    onInitializeAuthClient()
  }, [])

  return authClient ? (
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Button shadow color="success" onPress={onOpenModal}>
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
          <Text color="grey">{response}</Text>
        </Modal.Body>
      </Modal>
    </>
  ) : (
    <Spinner />
  )
}
