import { Button } from '@chakra-ui/react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'

export function ConnectButton() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const modal = useWeb3Modal()

  return isConnected ? (
    <>
      <Button onClick={() => modal.open()}>{address}</Button>
      <Button onClick={() => disconnect()}>Disconnect</Button>
    </>
  ) : (
    <Button onClick={() => modal.open()}>Connect Wallet</Button>
  )
}
