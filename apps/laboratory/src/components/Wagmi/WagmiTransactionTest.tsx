import { Button, Stack, Link, Text, Spacer } from '@chakra-ui/react'
import { toast } from 'sonner'

import { parseGwei, type Address } from 'viem'
import { useEstimateGas, useSendTransaction, useAccount } from 'wagmi'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { useCallback, useState } from 'react'
import { optimism, optimismSepolia, sepolia } from 'wagmi/chains'

const TEST_TX = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.001')
}

export function WagmiTransactionTest() {
  const { status, chain } = useAccount()
  const { data: gas, error: prepareError } = useEstimateGas(TEST_TX)
  const [isLoading, setLoading] = useState(false)
  const isConnected = status === 'connected'
  const { sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: hash => {
        setLoading(false)
        toast.success('Transaction Success', { description: hash })
      },
      onError: () => {
        setLoading(false)
        toast.error('Error', {
          description: 'Failed to send transaction'
        })
      }
    }
  })

  const onSendTransaction = useCallback(() => {
    if (prepareError) {
      toast.error('Error', {
        description: 'Not enough funds for transaction'
      })
    } else {
      setLoading(true)
      sendTransaction({
        ...TEST_TX,
        gas
      })
    }
  }, [sendTransaction, prepareError])

  const allowedChains = [sepolia.id, optimism.id, optimismSepolia.id] as number[]

  return allowedChains.includes(Number(chain?.id)) && status === 'connected' ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={!sendTransaction}
        isDisabled={isLoading || !isConnected}
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
      Switch to Sepolia or OP to test this feature
    </Text>
  )
}
