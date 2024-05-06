import { Button, Stack, Link, Text, Spacer } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { useSendCalls } from 'wagmi/experimental'
import { useCallback, useState } from 'react'
import { sepolia } from 'wagmi/chains'
import { useChakraToast } from '../Toast'
import { parseGwei, type Address } from 'viem'
import { vitalikEthAddress } from '../../utils/DataUtil'

const TEST_TX_1 = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.001')
}
const TEST_TX_2 = {
  to: vitalikEthAddress as Address,
  data: '0xdeadbeef' as `0x${string}`
}

export function WagmiSendCallsTest() {
  const [isLoading, setLoading] = useState(false)
  const { status, chain } = useAccount()
  const isConnected = status === 'connected'
  const toast = useChakraToast()

  const { sendCalls } = useSendCalls({
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

  const onSendCalls = useCallback(() => {
    setLoading(true)
    sendCalls({
      calls: [TEST_TX_1, TEST_TX_2]
    })
  }, [sendCalls])

  const allowedChains = [sepolia.id] as number[]

  return allowedChains.includes(Number(chain?.id)) && status === 'connected' ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendCalls}
        disabled={!sendCalls}
        isDisabled={isLoading || !isConnected}
      >
        Send Batch Calls to Vitalik
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
      Switch to Sepolia to test this feature
    </Text>
  )
}
