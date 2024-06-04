import { Button, Stack, Text, Input } from '@chakra-ui/react'
import { useAccount, useConnections } from 'wagmi'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useState, useEffect } from 'react'
import { useChakraToast } from '../Toast'
import { EIP_5792_RPC_METHODS } from '../../utils/EIP5792Utils'
import { bigIntReplacer } from '../../utils/CommonUtils'
import { useCallsStatus } from 'wagmi/experimental'

export function WagmiGetCallsStatusTest() {
  const [ethereumProvider, setEthereumProvider] =
    useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()
  const [enableGetCallsStatus, setEnableGetCallsStatus] = useState(false)
  const [batchCallId, setBatchCallId] = useState('')

  const { status, address } = useAccount()
  const isConnected = status === 'connected'
  const connection = useConnections()
  const toast = useChakraToast()
  const {
    isLoading,
    isFetched,
    error,
    data: callsStatusResult
  } = useCallsStatus({
    id: batchCallId,
    query: {
      enabled: enableGetCallsStatus && isConnected
    }
  })

  useEffect(() => {
    if (isConnected) {
      fetchProvider()
    }
  }, [isConnected])
  useEffect(() => {
    if (enableGetCallsStatus && isFetched && callsStatusResult) {
      toast({
        title: 'GetCallsStatus Success',
        description: JSON.stringify(callsStatusResult, bigIntReplacer),
        type: 'success'
      })
      setEnableGetCallsStatus(false)
    }
    if (error) {
      toast({
        title: 'GetCallsStatus Error',
        description: 'Failed to get calls status',
        type: 'error'
      })
      setEnableGetCallsStatus(false)
    }
  }, [enableGetCallsStatus, isFetched, error, callsStatusResult])

  function isGetCallsStatusSupported(): boolean {
    return Boolean(
      ethereumProvider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(
        EIP_5792_RPC_METHODS.WALLET_GET_CALLS_STATUS
      )
    )
  }
  async function fetchProvider() {
    const connectedProvider = await connection?.[0]?.connector?.getProvider()
    if (connectedProvider instanceof EthereumProvider) {
      setEthereumProvider(connectedProvider)
    }
  }

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
        Wallet does not support wallet_getCallsStatus rpc method
      </Text>
    )
  }

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
        onClick={() => setEnableGetCallsStatus(true)}
        isDisabled={isLoading || !batchCallId}
      >
        Get Calls Status
      </Button>
    </Stack>
  )
}
