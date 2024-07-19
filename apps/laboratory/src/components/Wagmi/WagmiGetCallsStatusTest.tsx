import { Button, Stack, Text, Input } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { useState, useCallback } from 'react'
import { useChakraToast } from '../Toast'
import { EIP_5792_RPC_METHODS } from '../../utils/EIP5792Utils'
import { bigIntReplacer } from '../../utils/CommonUtils'
import { useCallsStatus } from 'wagmi/experimental'
import { useWagmiAvailableCapabilities } from '../../hooks/useWagmiActiveCapabilities'

export function WagmiGetCallsStatusTest() {
  const { ethereumProvider, isMethodSupported: isGetCallsStatusSupported } =
    useWagmiAvailableCapabilities({
      method: EIP_5792_RPC_METHODS.WALLET_GET_CALLS_STATUS
    })

  const { status, address } = useAccount()

  const isConnected = status === 'connected'

  if (!isConnected || !ethereumProvider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }

  if (!isGetCallsStatusSupported()) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support the "wallet_getCallsStatus" RPC method
      </Text>
    )
  }

  return <AvailableTestContent />
}

function AvailableTestContent() {
  const [batchCallId, setBatchCallId] = useState('')

  const toast = useChakraToast()
  const { isLoading, refetch: getCallsStatus } = useCallsStatus({
    id: batchCallId,
    query: {
      enabled: false
    }
  })

  const onGetCallsStatus = useCallback(async () => {
    const { error, data: callsStatusResult } = await getCallsStatus()

    if (callsStatusResult) {
      toast({
        title: 'GetCallsStatus Success',
        description: JSON.stringify(callsStatusResult, bigIntReplacer),
        type: 'success'
      })
    }

    if (error) {
      toast({
        title: 'GetCallsStatus Error',
        description: 'Failed to get calls status',
        type: 'error'
      })
    }
  }, [getCallsStatus])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Input
        placeholder="0xf34ffa..."
        onChange={e => setBatchCallId(e.target.value)}
        value={batchCallId}
        isDisabled={isLoading}
      />
      <Button
        data-test-id="get-calls-status-button"
        onClick={onGetCallsStatus}
        isDisabled={isLoading || !batchCallId}
        isLoading={isLoading}
      >
        Get Calls Status
      </Button>
    </Stack>
  )
}
