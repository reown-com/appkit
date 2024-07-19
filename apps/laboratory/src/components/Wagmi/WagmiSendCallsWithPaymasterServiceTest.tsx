import { Button, Input, Stack, Text, Tooltip } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { useSendCalls } from 'wagmi/experimental'
import { useCallback, useState } from 'react'
import { useChakraToast } from '../Toast'
import { parseGwei, type Address } from 'viem'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES } from '../../utils/EIP5792Utils'
import { useWagmiAvailableCapabilities } from '../../hooks/useWagmiActiveCapabilities'

const TEST_TX_1 = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.001')
}
const TEST_TX_2 = {
  to: vitalikEthAddress as Address,
  data: '0xdeadbeef' as `0x${string}`
}

export function WagmiSendCallsWithPaymasterServiceTest() {
  const {
    ethereumProvider,
    supportedChains,
    supportedChainsName,
    currentChainsInfo,
    isMethodSupported: isSendCallsSupported
  } = useWagmiAvailableCapabilities({
    capability: WALLET_CAPABILITIES.PAYMASTER_SERVICE,
    method: EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
  })

  const { address, status } = useAccount()

  const isConnected = status === 'connected'

  if (!isConnected || !ethereumProvider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }

  if (!isSendCallsSupported()) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support "wallet_sendCalls" RPC method
      </Text>
    )
  }

  if (supportedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account does not support paymaster service feature
      </Text>
    )
  }

  if (!currentChainsInfo) {
    return (
      <Text fontSize="md" color="yellow">
        Switch to {supportedChainsName} to test this feature
      </Text>
    )
  }

  return <AvailableTestContent />
}

function AvailableTestContent() {
  const [paymasterServiceUrl, setPaymasterServiceUrl] = useState<string>('')
  const [isLoading, setLoading] = useState(false)

  const toast = useChakraToast()

  const { sendCalls } = useSendCalls({
    mutation: {
      onSuccess: hash => {
        setLoading(false)
        toast({
          title: 'SendCalls Success',
          description: hash,
          type: 'success'
        })
      },
      onError: () => {
        setLoading(false)
        toast({
          title: 'SendCalls Error',
          description: 'Failed to send calls',
          type: 'error'
        })
      }
    }
  })

  const onSendCalls = useCallback(() => {
    setLoading(true)
    if (!paymasterServiceUrl) {
      throw Error('paymasterServiceUrl not set')
    }
    sendCalls({
      calls: [TEST_TX_1, TEST_TX_2],
      capabilities: {
        paymasterService: {
          url: paymasterServiceUrl
        }
      }
    })
  }, [sendCalls, paymasterServiceUrl])

  return (
    <Stack direction={['column', 'column', 'column']}>
      <Tooltip label="Paymaster Service URL should be of ERC-7677 paymaster service proxy">
        <Input
          placeholder="http://api.pimlico.io/v2/sepolia/rpc?apikey=..."
          onChange={e => setPaymasterServiceUrl(e.target.value)}
          value={paymasterServiceUrl}
          isDisabled={isLoading}
          whiteSpace="nowrap"
          textOverflow="ellipsis"
        />
      </Tooltip>
      <Button
        width={'fit-content'}
        data-test-id="send-calls-paymaster-service-button"
        onClick={onSendCalls}
        disabled={!sendCalls}
        isDisabled={isLoading || !paymasterServiceUrl}
      >
        SendCalls w/ Paymaster Service
      </Button>
    </Stack>
  )
}
