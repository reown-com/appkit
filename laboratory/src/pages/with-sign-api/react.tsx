import { Button, Card, Divider, Modal, Text } from '@nextui-org/react'
import { getSdkError } from '@walletconnect/utils'
import { Web3ModalSign, useConnect, useDisconnect, useSession } from '@web3modal/sign-react'
import { useEffect, useState } from 'react'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

const projectId = getProjectId()

export default function WithSignReactPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const session = useSession()
  const { disconnect } = useDisconnect({
    topic: session?.topic as string,
    reason: getSdkError('USER_DISCONNECTED')
  })
  const { connect, data } = useConnect({
    requiredNamespaces: {
      eip155: {
        methods: ['eth_sendTransaction', 'personal_sign'],
        chains: ['eip155:1'],
        events: ['chainChanged', 'accountsChanged']
      }
    }
  })

  function onConnect() {
    connect()
  }

  function onDisconnect() {
    disconnect()
  }

  useEffect(() => {
    if (data?.topic) {
      setModalOpen(true)
    }
  }, [data?.topic])

  return (
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          {session ? (
            <>
              {/* <Button shadow color="primary" onPress={onSignMessage}>
                Sign Message
              </Button> */}
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
          <Text color="grey">{JSON.stringify(data, null, 2)}</Text>
        </Modal.Body>
      </Modal>

      <Web3ModalSign
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
