import { Button, useToast } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/web3js/react'
import Web3 from 'web3'

export function Web3jsConnectButton() {
  const toast = useToast()
  const { isConnected, address } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  async function onSignMessage() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      const web3 = new Web3(walletProvider)
      const msg = web3.utils.toHex('Hello Web3Modal Web3js')

      const signature = await web3.eth.personal.sign(msg, address, '')

      toast({ title: 'Success', description: signature, status: 'success', isClosable: true })
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
