import { Button, Card, Spacer } from '@nextui-org/react'
import {
  Web3Button,
  Web3NetworkSwitch,
  useWeb3Modal,
  useWeb3ModalEvents,
  useWeb3ModalTheme
} from '@web3modal/react'
import { useAccount, useNetwork, useSignMessage, useSignTypedData } from 'wagmi'
import { NotificationCtrl } from '../controllers/NotificationCtrl'
import { DEMO_SIGN_TYPED_DATA_REQUEST } from '../data/Constants'

const message = 'Hello Web3Modal!'

export default function WagmiWeb3ModalWidget() {
  // -- Web3Modal Hooks -------------------------------------------------------
  useWeb3ModalEvents(event => console.info(event))
  const { setTheme } = useWeb3ModalTheme()
  const { open } = useWeb3Modal()

  // -- Wagmi Hooks -----------------------------------------------------------
  const { chain } = useNetwork()
  const { isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage({ message })
  const { signTypedDataAsync } = useSignTypedData(DEMO_SIGN_TYPED_DATA_REQUEST(chain?.id))

  function getData(data: unknown) {
    if (typeof data === 'object' || Array.isArray(data)) {
      return JSON.stringify(data, null, 2)
    }

    return String(data)
  }

  async function onSignTypedData() {
    try {
      const data = await signTypedDataAsync()
      NotificationCtrl.open('Sign Typed Data', getData(data))
    } catch (error) {
      NotificationCtrl.open('Sign Typed Data', JSON.stringify(error))
    }
  }

  async function onSignMessage() {
    try {
      const data = await signMessageAsync()
      NotificationCtrl.open('Sign Message', getData(data))
    } catch (error) {
      NotificationCtrl.open('Sign Message', JSON.stringify(error))
    }
  }

  return (
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Web3Button balance="show" />

          <Spacer />

          <Web3NetworkSwitch />

          <Spacer />

          {isConnected ? (
            <>
              <Button onPress={onSignMessage} data-testid="lab-sign">
                Sign Message
              </Button>
              <Spacer />
              <Button onPress={onSignTypedData} data-testid="lab-sign-typed">
                Sign Typed Data
              </Button>
            </>
          ) : (
            <>
              <Button color="secondary" onPress={async () => open()}>
                Custom Connect Button
              </Button>
              <Spacer />
              <Button
                css={{ backgroundColor: 'teal' }}
                onPress={() =>
                  setTheme({
                    themeVariables: {
                      '--w3m-accent-color': 'teal',
                      '--w3m-background-color': 'teal'
                    }
                  })
                }
              >
                Set teal theme
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </>
  )
}
