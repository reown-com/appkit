import { Button, Card, Modal, Text } from '@nextui-org/react'
import { Web3ModalAuth } from '@web3modal/auth-html'
import { useState } from 'react'
import { DEMO_METADATA, DEMO_STATEMENT } from '../../data/Constants'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

const web3ModalAuth = new Web3ModalAuth({
  projectId: getProjectId(),
  modalOptions: { themeMode: getTheme() },
  metadata: DEMO_METADATA
})

export default function WithAuthHtmlPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [response, setResponse] = useState('')

  async function onSignIn() {
    const data = await web3ModalAuth.signIn(DEMO_STATEMENT)
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
    </>
  )
}
