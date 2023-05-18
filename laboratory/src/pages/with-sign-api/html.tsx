import { Button, Card, Divider, Modal, Text } from '@nextui-org/react'
import { getAddressFromAccount, getSdkError } from '@walletconnect/utils'
import type { Web3ModalSignSession } from '@web3modal/sign-html'
import { Web3ModalSign } from '@web3modal/sign-html'
import { useEffect, useState } from 'react'
import { METADATA } from '../../data/Constants'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

const projectId = getProjectId()

const web3ModalSign = new Web3ModalSign({
  projectId,
  modalOptions: {
    themeMode: getTheme()
  },
  metadata: METADATA
})

export default function WithSignHtmlPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [response, setResponse] = useState('')
  const [session, setSession] = useState<Web3ModalSignSession | undefined>(undefined)

  async function onConnect() {
    const result = await web3ModalSign.connect({
      requiredNamespaces: {
        eip155: {
          methods: ['eth_sendTransaction', 'personal_sign'],
          chains: ['eip155:1'],
          events: ['chainChanged', 'accountsChanged']
        }
      }
    })
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
      const result = await web3ModalSign.request({
        topic: session.topic,
        chainId: 'eip155:1',
        request: {
          method: 'personal_sign',
          params: ['0xdeadbeaf', account]
        }
      })
      setResponse(JSON.stringify(result, null, 2))
    } else {
      setResponse('No active session, please connect first')
    }
    setModalOpen(true)
  }

  useEffect(() => {
    async function init() {
      const result = await web3ModalSign.getActiveSession()
      setSession(result)
    }

    function logData(data: unknown) {
      console.info(data)
    }

    function deleteSession() {
      setSession(undefined)
    }

    web3ModalSign.onSessionEvent(logData)
    web3ModalSign.onSessionUpdate(logData)
    web3ModalSign.onSessionDelete(deleteSession)

    init()

    return () => {
      web3ModalSign.offSessionEvent(logData)
      web3ModalSign.offSessionUpdate(logData)
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
