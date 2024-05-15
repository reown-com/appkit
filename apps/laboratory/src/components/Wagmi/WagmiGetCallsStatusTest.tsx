import { Button, Stack, Text, Input } from '@chakra-ui/react'
import { useAccount, useConnections } from 'wagmi'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { getCallsStatus } from '@wagmi/core/experimental'
import { useCallback, useState, useEffect } from 'react'
import { useChakraToast } from '../Toast'
import { EIP_5792_RPC_METHODS, getCapabilitySupportedChainInfoForEthers } from '../../utils/EIP5792Utils'
import { wagmiConfig } from '../../pages/library/wagmi'
import { bigIntReplacer } from '../../utils/CommonUtils'

export function WagmiGetCallsStatusTest() {
  const [provider, setProvider] = useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()
  const [isLoading, setLoading] = useState(false)
  const { status, chain, address } = useAccount()
  const connection = useConnections()
  const isConnected = status === 'connected'
  const toast = useChakraToast()
  const [batchCallId, setBatchCallId] = useState('')

  const onGetCallsStatus = useCallback(async () => {
    setLoading(true)
    try {
      const batchCallsStatus = await getCallsStatus(wagmiConfig, { id: batchCallId })
      toast({
        title: 'Success',
        description: JSON.stringify(batchCallsStatus, bigIntReplacer),
        type: 'success'
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to get calls status',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }, [batchCallId, toast])

  function isGetCallsStatusSupported(): boolean {
    return Boolean(
      provider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(
        EIP_5792_RPC_METHODS.WALLET_GET_CALLS_STATUS
      )
    )
  }

  useEffect(() => {
    async function fetchProvider() {
      const connectedProvider = await connection?.[0]?.connector?.getProvider()
      const ethereumProvider = connectedProvider as Awaited<
        ReturnType<(typeof EthereumProvider)['init']>
      >
      setProvider(ethereumProvider)
    }

    if (status === 'connected') {
      fetchProvider()
    }
  }, [status, connection])

  if (status !== 'connected' || !provider) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }

  if (!isGetCallsStatusSupported()) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet do not support this feature
      </Text>
    )
  }

  const allowedChains = getCapabilitySupportedChainInfoForEthers('atomicBatch',provider, address)

  if (allowedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account do not support this feature
      </Text>
    )
  }

  return allowedChains.find(chainInfo => chainInfo.chainId === Number(chain?.id)) &&
    status === 'connected' ? (
    <Stack direction={['column', 'column', 'row']}>
      <Input
        placeholder="0xf34ffa..."
        onChange={e => setBatchCallId(e.target.value)}
        value={batchCallId}
      />
      <Button
        data-test-id="sign-transaction-button"
        onClick={onGetCallsStatus}
        isDisabled={isLoading || !isConnected}
      >
        Get Calls Status
      </Button>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {allowedChains.map(ci => ci.chainName).join(', ')} to test this feature
    </Text>
  )
}
