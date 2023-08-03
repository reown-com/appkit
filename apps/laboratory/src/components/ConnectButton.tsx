import { Button } from '@chakra-ui/react'
import { useAccount, useDisconnect } from 'wagmi'
import { modal } from '../pages/index'

export function ConnectButton() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  return isConnected ? (
    <>
      <Button onClick={() => modal.open()} data-testid="partial-account-address">
        {address}
      </Button>
      <Button onClick={() => disconnect()} data-testid="view-account-disconnect-button">
        Disconnect
      </Button>
    </>
  ) : (
    <Button onClick={() => modal.open()} data-testid="partial-core-connect-button">
      Connect Wallet
    </Button>
  )
}
