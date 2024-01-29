import { Button, useToast, Stack, Text } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

import { solanaDevnet } from '../../utils/ChainsUtil'
import { useState } from 'react'

const WALLECT_CONNECT_DEVNET_ADDRESS = '2yr4zgYEyWRqFrNym31X1oJ4NprJsXjATEQb5XnkFY8v'

export function SolanaSignTransactionTest() {
  const toast = useToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)

  async function onSendTransaction() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      console.log(`walletProvider`, walletProvider);
      const tx = await walletProvider.signTransaction('transfer',
        {
          to: WALLECT_CONNECT_DEVNET_ADDRESS,
          amountInLamports: 100000000,
          feePayer: 'to'
        })
      toast({ title: 'Succcess', description: tx.blockHash, status: 'success', isClosable: true })
    } catch (err) {
      console.log(`err`, err);
      toast({
        title: 'Error',
        description: 'Failed to sign transaction',
        status: 'error',
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  return chainId === solanaDevnet.chainId && address ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        isDisabled={loading}
      >
        Sign Transaction
      </Button>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Solana Devnet to test this feature
    </Text>
  )
}
