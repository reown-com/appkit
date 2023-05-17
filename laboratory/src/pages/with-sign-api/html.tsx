import { Button, Card, Modal, Text } from '@nextui-org/react'
import { Web3ModalSign } from '@web3modal/sign-html'
import { useState } from 'react'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

const projectId = getProjectId()

const web3ModalSign = new Web3ModalSign({
  projectId,
  modalOptions: {
    themeMode: getTheme()
  },
  metadata: {
    name: 'Web3Modal Lab',
    description: 'Web3Modal Laboratory',
    url: 'lab.web3modal.com',
    icons: ['https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg']
  }
})

export default function WithSignHtmlPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [response, setResponse] = useState('')

  async function onSignIn() {
    const session = await web3ModalSign.connect({
      requiredNamespaces: {
        eip155: {
          methods: ['eth_sendTransaction', 'personal_sign'],
          chains: ['eip155:1', 'eip155:137'],
          events: ['chainChanged', 'accountsChanged']
        }
      }
    })
    setResponse(JSON.stringify(session, null, 2))
    setModalOpen(true)
  }

  return (
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Button shadow color="primary" onPress={onSignIn}>
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
