import { Button } from '@chakra-ui/react'
import { useAccount, useDisconnect } from 'wagmi'
import { modal } from '../pages/index'

export function ConnectButton() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  return isConnected ? (
    <>
      <Button onClick={() => modal.open()}>{address}</Button>
      <Button onClick={() => disconnect()}>Disconnect</Button>
    </>
  ) : (
    <Button onClick={() => modal.open()}>Connect Wallet</Button>
  )
}
