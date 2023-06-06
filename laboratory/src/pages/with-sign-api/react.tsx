import { Button, Card, Divider } from '@nextui-org/react'
import { getAddressFromAccount, getSdkError } from '@walletconnect/utils'
import {
  Web3ModalSign,
  useConnect,
  useDisconnect,
  useRequest,
  useSession
} from '@web3modal/sign-react'
import { NotificationCtrl } from '../../controllers/NotificationCtrl'
import { DEMO_METADATA, DEMO_NAMESPACE, DEMO_SIGN_REQUEST } from '../../data/Constants'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

export default function WithSignReactPage() {
  const session = useSession()
  const { request } = useRequest(
    DEMO_SIGN_REQUEST(
      session?.topic as string,
      getAddressFromAccount(session?.namespaces.eip155.accounts[0] ?? '')
    )
  )
  const { disconnect } = useDisconnect({
    topic: session?.topic as string,
    reason: getSdkError('USER_DISCONNECTED')
  })
  const { connect } = useConnect(DEMO_NAMESPACE)

  async function onConnect() {
    const result = await connect()
    NotificationCtrl.open('Connect', JSON.stringify(result, null, 2))
  }

  function onDisconnect() {
    disconnect()
  }

  async function onSignMessage() {
    const result = await request()
    NotificationCtrl.open('Sign Message', JSON.stringify(result, null, 2))
  }

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

      <Web3ModalSign
        projectId={getProjectId()}
        modalOptions={{ themeMode: getTheme(), enableExplorer: false }}
        metadata={DEMO_METADATA}
      />
    </>
  )
}
