import { Button, Card, Loading, Spacer } from '@nextui-org/react'
import { getAddressFromAccount, getSdkError } from '@walletconnect/utils'
import {
  Web3ModalSign,
  useConnect,
  useDisconnect,
  useRequest,
  useSession
} from '@web3modal/sign-react'
import { getErrorMessage, showErrorToast } from 'laboratory/src/utilities/ErrorUtil'
import { useState } from 'react'
import { NotificationCtrl } from '../../controllers/NotificationCtrl'
import { DEMO_METADATA, DEMO_NAMESPACE, DEMO_SIGN_REQUEST } from '../../data/Constants'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

export default function WithSignReactPage() {
  const [disconnecting, setDisconnecting] = useState<boolean>(false)
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
    try {
      setDisconnecting(false)
      const result = await connect()
      NotificationCtrl.open('Connect', JSON.stringify(result, null, 2))
    } catch (error) {
      const message = getErrorMessage(error)
      showErrorToast(message)
    }
  }

  function onDisconnect() {
    if (!disconnecting) {
      setDisconnecting(true)
      try {
        disconnect()
      } catch (error) {
        const message = getErrorMessage(error)
        showErrorToast(message)
      }
    }
  }

  async function onSignMessage() {
    try {
      const result = await request()
      NotificationCtrl.open('Sign Message', JSON.stringify(result, null, 2))
    } catch (error) {
      const message = getErrorMessage(error)
      showErrorToast(message)
    }
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
              <Spacer />
              <Button shadow color="error" onPress={onDisconnect} disabled={disconnecting}>
                {disconnecting ? <Loading size="xs" color={'white'} /> : 'Disconnect'}
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
        modalOptions={{
          themeMode: getTheme(),
          mobileWallets: [
            {
              id: 'metamask',
              name: 'MetaMask',
              links: {
                native: 'metamask://',
                universal: ''
              }
            }
          ]
        }}
        metadata={DEMO_METADATA}
      />
    </>
  )
}
