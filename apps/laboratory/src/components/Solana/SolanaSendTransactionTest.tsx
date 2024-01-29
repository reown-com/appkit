import { Button, useToast, Stack, Link, Text, Spacer } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

import { solanaDevnet } from '../../utils/ChainsUtil'
import { useState } from 'react'

const WALLECT_CONNECT_DEVNET_ADDRESS = '2yr4zgYEyWRqFrNym31X1oJ4NprJsXjATEQb5XnkFY8v'
const PHANTOM_DEVNET_ADDRESS = 'EmT8r4E8ZjoQgt8sXGbaWBRMKfUXsVT1wonoSnJZ4nBn'

export function SolanaSendTransactionTest() {
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
      const tx = await walletProvider.signAndSendTransaction('transfer',
        {
          to: PHANTOM_DEVNET_ADDRESS,
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
        Sign and Send Transaction
      </Button>

      <Spacer />

      <Link isExternal href="https://solfaucet.com/">
        <Button variant="outline" colorScheme="blue" isDisabled={loading}>
          Solana Faucet 1
        </Button>
      </Link>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Solana Devnet to test this feature
    </Text>
  )
}
