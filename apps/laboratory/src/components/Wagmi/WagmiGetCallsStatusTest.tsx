import { useCallback, useState } from 'react'

import { Button, Input, Stack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { useCallsStatus } from 'wagmi/experimental'

import { useAppKitAccount } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'
import { bigIntReplacer } from '@/src/utils/CommonUtils'
import { EIP_5792_RPC_METHODS } from '@/src/utils/EIP5792Utils'

export function WagmiGetCallsStatusTest() {
  const { address } = useAppKitAccount({ namespace: 'eip155' })
  const { status } = useAccount()

  const { isMethodSupported } = useWagmiAvailableCapabilities()

  const isConnected = status === 'connected'

  if (!isConnected || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }

  if (!isMethodSupported(EIP_5792_RPC_METHODS.WALLET_GET_CALLS_STATUS)) {
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
        data-testid="get-calls-id-input"
      />
      <Button
        data-testid="get-calls-status-button"
        onClick={onGetCallsStatus}
        isDisabled={isLoading || !batchCallId}
        isLoading={isLoading}
      >
        Get Calls Status
      </Button>
    </Stack>
  )
}
