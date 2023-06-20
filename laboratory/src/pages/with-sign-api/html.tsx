import { Button, Card, Loading, Spacer } from '@nextui-org/react'
import { getAddressFromAccount, getSdkError } from '@walletconnect/utils'
import type { Web3ModalSignSession } from '@web3modal/sign-html'
import { Web3ModalSign } from '@web3modal/sign-html'
import { getErrorMessage, showErrorToast } from 'laboratory/src/utilities/ErrorUtil'
import { useEffect, useState } from 'react'
import { NotificationCtrl } from '../../controllers/NotificationCtrl'
import { DEMO_METADATA, DEMO_NAMESPACE, DEMO_SIGN_REQUEST } from '../../data/Constants'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

const web3ModalSign = new Web3ModalSign({
  projectId: getProjectId(),
  modalOptions: {
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
  },
  metadata: DEMO_METADATA
})

export default function WithSignHtmlPage() {
  const [session, setSession] = useState<Web3ModalSignSession | undefined>(undefined)
  const [disconnecting, setDisconnecting] = useState<boolean>(false)

  async function onConnect() {
    try {
      const result = await web3ModalSign.connect(DEMO_NAMESPACE)
      setSession(result)
      NotificationCtrl.open('Connect', JSON.stringify(result, null, 2))
    } catch (error) {
      const message = getErrorMessage(error)
      showErrorToast(message)
    }
  }

  async function onDisconnect() {
    if (!disconnecting) {
      if (session) {
        setDisconnecting(true)
        try {
          await web3ModalSign.disconnect({
            topic: session.topic,
            reason: getSdkError('USER_DISCONNECTED')
          })
        } catch (error) {
          const message = getErrorMessage(error)
          showErrorToast(message)
        }
        setDisconnecting(false)
        setSession(undefined)
      }
    }
  }

  async function onSignMessage() {
    try {
      if (session) {
        const account = getAddressFromAccount(session.namespaces.eip155.accounts[0])
        const result = await web3ModalSign.request(DEMO_SIGN_REQUEST(session.topic, account))
        NotificationCtrl.open('Sign Message', JSON.stringify(result, null, 2))
      } else {
        NotificationCtrl.open('Sign Message', 'No active session, please connect first')
      }
    } catch (error) {
      const message = getErrorMessage(error)
      showErrorToast(message)
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const result = await web3ModalSign.getSession()
        setSession(result)
      } catch (error) {
        const message = getErrorMessage(error)
        showErrorToast(message)
      }
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
    </>
  )
}
