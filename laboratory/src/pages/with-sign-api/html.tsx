import { Button, Card, Divider, Modal, Text } from '@nextui-org/react'
import { getAddressFromAccount, getSdkError } from '@walletconnect/utils'
import type { Web3ModalSignSession } from '@web3modal/sign-html'
import { Web3ModalSign } from '@web3modal/sign-html'
import { useEffect, useState } from 'react'
import { DEMO_METADATA, DEMO_NAMESPACE, DEMO_SIGN_REQUEST } from '../../data/Constants'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

const web3ModalSign = new Web3ModalSign({
  projectId: getProjectId(),
  modalOptions: { themeMode: getTheme() },
  metadata: DEMO_METADATA
})

export default function WithSignHtmlPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [response, setResponse] = useState('')
  const [session, setSession] = useState<Web3ModalSignSession | undefined>(undefined)

  async function onConnect() {
    const result = await web3ModalSign.connect(DEMO_NAMESPACE)
    setSession(result)
    setResponse(JSON.stringify(result, null, 2))
    setModalOpen(true)
  }

  async function onDisconnect() {
    if (session) {
      await web3ModalSign.disconnect({
        topic: session.topic,
        reason: getSdkError('USER_DISCONNECTED')
      })
      setSession(undefined)
    }
  }

  async function onSignMessage() {
    if (session) {
      const account = getAddressFromAccount(session.namespaces.eip155.accounts[0])
      const result = await web3ModalSign.request(DEMO_SIGN_REQUEST(session.topic, account))
      setResponse(JSON.stringify(result, null, 2))
    } else {
      setResponse('No active session, please connect first')
    }
    setModalOpen(true)
  }

  useEffect(() => {
    async function init() {
      const result = await web3ModalSign.getSession()
      setSession(result)
    }

    function deleteSession() {
      setSession(undefined)
    }

    web3ModalSign.onSessionDelete(deleteSession)
    init()

    return () => {
      web3ModalSign.offSessionDelete(deleteSession)
    }
  }, [])

  return (
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          {session ? (
            <>
              <Button shadow color="primary" onPress={onSignMessage}>
                Sign Message
              </Button>
              <Divider y={2} />
              <Button shadow color="error" onPress={onDisconnect}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button shadow color="primary" onPress={onConnect}>
              Connect
            </Button>
          )}
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
