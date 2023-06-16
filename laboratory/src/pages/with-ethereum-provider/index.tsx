import { Button, Card, Spacer } from '@nextui-org/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import type { EthereumProvider as IEthereumProvider } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'
import { DEMO_SIGN_REQUEST } from 'laboratory/src/data/Constants'
import { useEffect, useState } from 'react'
import { NotificationCtrl } from '../../controllers/NotificationCtrl'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

export default function WithEthereumProvider() {
  const [providerClient, setProviderClient] = useState<IEthereumProvider | undefined>(undefined)
  const [session, setSession] = useState<boolean>(false)

  async function onInitializeProviderClient() {
    const client = await EthereumProvider.init({
      projectId: getProjectId(),
      showQrModal: true,
      qrModalOptions: { themeMode: getTheme() },
      chains: [1],
      methods: ['eth_sendTransaction', 'personal_sign'],
      events: ['connect', 'disconnect']
    })
    if (client.session) {
      setSession(true)
    }
    setProviderClient(client)
  }

  async function onConnect() {
    if (providerClient) {
      await providerClient.connect()
      setSession(true)
      NotificationCtrl.open('Connect', JSON.stringify(providerClient.session, null, 2))
    } else {
      throw new Error('providerClient is not initialized')
    }
  }

  async function onDisconnect() {
    if (providerClient) {
      await providerClient.disconnect()
      setSession(false)
    } else {
      throw new Error('providerClient is not initialized')
    }
  }

  async function onSignMessage() {
    if (providerClient?.session) {
      const { request } = DEMO_SIGN_REQUEST(
        providerClient.session.topic,
        providerClient.accounts[0]
      )
      const result = await providerClient.request(request)
      NotificationCtrl.open('Sign Message', JSON.stringify(result, null, 2))
    } else {
      throw new Error('providerClient is not initialized')
    }
  }

  useEffect(() => {
    if (providerClient) {
      providerClient.on('disconnect', () => {
        setSession(false)
      })
    }
  }, [providerClient])

  useEffect(() => {
    onInitializeProviderClient()
  }, [])

  return (
    <>
      {providerClient && (
        <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
          <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            {session ? (
              <>
                <Button shadow color="primary" onPress={onSignMessage}>
                  Sign Message
                </Button>
                <Spacer />
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
      )}
    </>
  )
}
