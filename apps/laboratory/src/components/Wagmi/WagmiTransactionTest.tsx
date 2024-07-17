import { Button, Stack, Link, Text, Spacer } from '@chakra-ui/react'
import { parseGwei, type Address } from 'viem'
import { useEstimateGas, useSendTransaction, useAccount } from 'wagmi'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { useCallback, useState } from 'react'
import { optimism, optimismSepolia, sepolia } from 'wagmi/chains'
import { useChakraToast } from '../Toast'

const TEST_TX = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.001')
}

const ALLOWED_CHAINS = [sepolia.id, optimism.id, optimismSepolia.id] as number[]

export function WagmiTransactionTest() {
  const { status, chain } = useAccount()

  return ALLOWED_CHAINS.includes(Number(chain?.id)) && status === 'connected' ? (
    <AvailableTestContent />
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Sepolia or OP to test this feature
    </Text>
  )
}

function AvailableTestContent() {
  const toast = useChakraToast()
  const { refetch: estimateGas, isFetching: estimateGasFetching } = useEstimateGas({
    ...TEST_TX,
    query: {
      enabled: false
    }
  })
  const [isLoading, setLoading] = useState(false)

  const { sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: hash => {
        setLoading(false)
        toast({
          title: 'Transaction Success',
          description: hash,
          type: 'success'
        })
      },
      onError: () => {
        setLoading(false)
        toast({
          title: 'Error',
          description: 'Failed to sign transaction',
          type: 'error'
        })
      }
    }
  })

  const onSendTransaction = useCallback(async () => {
    const { data: gas, error: prepareError } = await estimateGas()

    if (prepareError) {
      toast({
        title: 'Error',
        description: 'Not enough funds for transaction',
        type: 'error'
      })
    } else {
      setLoading(true)
      sendTransaction({
        ...TEST_TX,
        gas
      })
    }
  }, [sendTransaction, estimateGas])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={!sendTransaction}
        isDisabled={isLoading}
        isLoading={estimateGasFetching}
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
  )
}
