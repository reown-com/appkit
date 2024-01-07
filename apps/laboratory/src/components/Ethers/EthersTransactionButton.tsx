import { Button, useToast } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers'
import { vitalikEthAddress } from '../../utils/DataUtil'

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
        to: vitalikEthAddress,
        value: ethers.parseUnits('0.001', 'gwei')
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
    <Button data-test-id="sign-transaction-button" onClick={onSendTransaction}>
      Send Transaction
    </Button>
  )
}
