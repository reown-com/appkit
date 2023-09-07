import { Button, useToast } from '@chakra-ui/react'
import { useAccount, useSignMessage } from 'wagmi'

export function ConnectButton() {
  const toast = useToast()
  const { isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage({ message: 'Hello Web3Modal!' })

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

  return (
    <>
      <w3m-button />
      {isConnected ? <Button onClick={() => onSignMessage()}>Sign Message</Button> : null}
    </>
  )
}
