import { Button, useToast } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers-5/react'

export function EthersConnectButton() {
  const toast = useToast()
  const { isConnected } = useWeb3ModalAccount()
  const { provider } = useWeb3ModalProvider()

  async function onSignMessage() {
    try {
      const signer = provider?.getSigner()

      const signature = await signer?.signMessage('Hello Web3Modal Ethers')
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
