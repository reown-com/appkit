import { Button, Card, Modal, Text } from '@nextui-org/react'
import { Web3ModalAuth } from '@web3modal/auth-html'
import { useState } from 'react'
import { getProjectId, getTheme } from '../utilities/EnvUtil'

const projectId = getProjectId()
const web3ModalAuth = new Web3ModalAuth({
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

export default function v2AuthHtmlPage() {
  const [modalOpen, setModalOpen] = useState(false)

  async function onConnect() {
    const data = await web3ModalAuth.connect({ statement: 'Connect to Web3Modal Lab' })
    console.info(data)
  }

  return (
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Button shadow color="success" onPress={onConnect}>
            Connect Auth Wallet
          </Button>
        </Card.Body>
      </Card>

      <Modal closeButton blur open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>
          <Text h3>Success</Text>
        </Modal.Header>
        <Modal.Body>
          <Text color="grey">TODO response</Text>
        </Modal.Body>
      </Modal>
    </>
  )
}
