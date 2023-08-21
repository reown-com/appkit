import { Button, useToast } from '@chakra-ui/react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'

export function ConnectButton() {
  const toast = useToast()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage({ message: 'Hello Web3Modal!' })
  const modal = useWeb3Modal()

  async function onSignMessage() {
    try {
      const signature = await signMessageAsync()
      toast({ title: 'Succcess', description: signature, status: 'success', isClosable: true })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to sign message',
        status: 'error',
        isClosable: true
      })
    }
  }

  return isConnected ? (
    <>
      <Button onClick={() => modal.open()}>{address}</Button>
      <Button onClick={() => disconnect()}>Disconnect</Button>
      <Button onClick={() => onSignMessage()}>Sign Message</Button>
    </>
  ) : (
    <Button onClick={() => modal.open()}>Connect Wallet</Button>
  )
}
