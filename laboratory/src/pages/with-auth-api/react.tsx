import { Button, Card, Modal, Text } from '@nextui-org/react'
import { Web3ModalAuth, useSignIn } from '@web3modal/auth-react'
import { useState } from 'react'
import { DEMO_METADATA, DEMO_STATEMENT } from '../../data/Constants'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

export default function WithAuthReactPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [response, setResponse] = useState('')
  const { signIn } = useSignIn(DEMO_STATEMENT)

  async function onSignIn() {
    const data = await signIn()
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
        projectId={getProjectId()}
        modalOptions={{ themeMode: getTheme() }}
        metadata={DEMO_METADATA}
      />
    </>
  )
}
