import { Button, useToast, Stack, Link, Text, Spacer } from '@chakra-ui/react'
import { parseEther, parseGwei } from 'viem'
import { usePrepareSendTransaction, useSendTransaction, useNetwork, useAccount } from 'wagmi'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { useCallback, useEffect } from 'react'
import { sepolia } from 'wagmi/chains'

export function WagmiTransactionTest() {
  const toast = useToast()
  const { chain } = useNetwork()
  const { status } = useAccount()
  const { config, error: prepareError } = usePrepareSendTransaction({
    to: vitalikEthAddress,
    value: parseEther('0.0001'),
    maxFeePerGas: parseGwei('200'),
    maxPriorityFeePerGas: parseGwei('200')
  })
  const { sendTransaction, data, error, reset, isLoading } = useSendTransaction(config)

  const onSendTransaction = useCallback(() => {
    if (prepareError) {
      toast({
        title: 'Error',
        description: 'Not enough funds to send transaction',
        status: 'error',
        isClosable: true
      })
    } else {
      sendTransaction?.()
    }
  }, [sendTransaction, prepareError])

  useEffect(() => {
    if (data) {
      toast({
        title: 'Transaction Success',
        description: data.hash,
        status: 'success',
        isClosable: true
      })
    } else if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send transaction',
        status: 'error',
        isClosable: true
      })
    }
    reset()
  }, [data, error])

  return chain?.id === sepolia.id && status === 'connected' ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={!sendTransaction}
        isDisabled={isLoading}
      >
        Send Transaction to Vitalik
      </Button>

      <Spacer />

      <Link isExternal href="https://sepoliafaucet.com">
        <Button variant="outline" colorScheme="blue" isDisabled={isLoading}>
          Sepolia Faucet 1
        </Button>
      </Link>

      <Link isExternal href="https://www.infura.io/faucet/sepolia">
        <Button variant="outline" colorScheme="orange" isDisabled={isLoading}>
          Sepolia Faucet 2
        </Button>
      </Link>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Sepolia Ethereum Testnet to test this feature
    </Text>
  )
}
