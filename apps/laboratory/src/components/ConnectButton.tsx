import type { ButtonProps } from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'
import { useAccount, useDisconnect } from 'wagmi'

interface Props {
  onConnect: ButtonProps['onClick']
}

export function ConnectButton({ onConnect }: Props) {
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return isConnected ? (
    <Button onClick={() => disconnect()}>Disconnect</Button>
  ) : (
    <Button onClick={onConnect}>Connect Wallet</Button>
  )
}
