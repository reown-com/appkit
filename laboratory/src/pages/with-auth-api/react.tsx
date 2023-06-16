import { Button, Card } from '@nextui-org/react'
import { Web3ModalAuth, useSignIn } from '@web3modal/auth-react'
import { NotificationCtrl } from '../../controllers/NotificationCtrl'
import { DEMO_METADATA, DEMO_STATEMENT } from '../../data/Constants'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

export default function WithAuthReactPage() {
  const { signIn } = useSignIn(DEMO_STATEMENT)

  async function onSignIn() {
    const data = await signIn()
    NotificationCtrl.open('Sign In', JSON.stringify(data, null, 2))
  }

  return (
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Button shadow color="success" onPress={onSignIn}>
            Sign In With Wallet
          </Button>
        </Card.Body>
      </Card>

      <Web3ModalAuth
        projectId={getProjectId()}
        modalOptions={{ themeMode: getTheme() }}
        metadata={DEMO_METADATA}
      />
    </>
  )
}
