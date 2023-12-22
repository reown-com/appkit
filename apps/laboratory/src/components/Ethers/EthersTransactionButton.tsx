import { Button, useToast } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers'

// Component
export function EthersTransactionButton() {
  const toast = useToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  async function onSendTransaction() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = new JsonRpcSigner(provider, address)
      const tx = await signer.sendTransaction({
        to: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        value: ethers.parseUnits('0.1', 'gwei')
      })

      toast({ title: 'Succcess', description: tx.blockHash, status: 'success', isClosable: true })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to sign transaction',
        status: 'error',
        isClosable: true
      })
    }
  }

  return (
    <>
      <>
        <Button onClick={() => onSendTransaction()}>Send Transaction</Button>
      </>
    </>
  )
}
