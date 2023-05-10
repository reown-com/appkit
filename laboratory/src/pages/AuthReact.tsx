import { Button, Card, Modal, Text } from '@nextui-org/react'
import { Web3ModalAuth, useSignIn } from '@web3modal/auth-react'
import { useState } from 'react'
import { getProjectId, getTheme } from '../utilities/EnvUtil'

const projectId = getProjectId()

export default function AuthReactPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [response, setResponse] = useState('')
  const signIn = useSignIn({ statement: 'Connect to Web3Modal Lab' })

  async function onSignIn() {
    const data = await signIn({ statement: 'Connect to Web3Modal Lab' })
    setResponse(JSON.stringify(data, null, 2))
    setModalOpen(true)
  }

  return (
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Button shadow color="success" onPress={onSignIn}>
            Sign In With Wallet
          </Button>
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

      <Web3ModalAuth
        projectId={projectId}
        modalOptions={{
          themeMode: getTheme()
        }}
        metadata={{
          name: 'Web3Modal Lab',
          description: 'Web3Modal Laboratory',
          url: 'lab.web3modal.com',
          icons: ['https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg']
        }}
      />
    </>
  )
}
