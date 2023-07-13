import type { ButtonProps } from '@chakra-ui/react'
import { Button, VStack } from '@chakra-ui/react'
import { useAccount, useDisconnect } from 'wagmi'

interface Props {
  onConnect: ButtonProps['onClick']
}

export function ConnectButton({ onConnect }: Props) {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  return isConnected ? (
    <VStack gap={4}>
      <Button onClick={onConnect}>{address}</Button>
      <Button onClick={() => disconnect()}>Disconnect</Button>
    </VStack>
  ) : (
    <Button onClick={onConnect}>Connect Wallet</Button>
  )
}
