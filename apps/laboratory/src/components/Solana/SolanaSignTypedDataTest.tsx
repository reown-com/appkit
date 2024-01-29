import { Button, useToast } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

export function SolanaSignTypedDataTest() {
  const toast = useToast()
  const { address } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  async function onSignTypedData() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      /* const provider = new BrowserProvider(walletProvider, chainId)
      const signer = new JsonRpcSigner(provider, address)
      const domain = {
        name: 'Ether Mail',
        version: '1',
        chainId,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      } as const

      const signature = await signer?.signTypedData(domain, types, message)

      toast({ title: 'Succcess', description: signature, status: 'success', isClosable: true }) */
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
    <Button data-testid="sign-typed-data-button" onClick={onSignTypedData}>
      Sign Typed Data
    </Button>
  )
}
