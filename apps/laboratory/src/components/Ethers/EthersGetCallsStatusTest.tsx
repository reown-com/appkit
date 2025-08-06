import { useEffect, useState } from 'react'

import { Button, Input, Stack, Text } from '@chakra-ui/react'
import { BrowserProvider } from 'ethers'

import {
  type Provider,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider
} from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { useEthersActiveCapabilities } from '@/src/hooks/useEthersActiveCapabilities'
import { type GetCallsStatusParams } from '@/src/types/EIP5792'
import { EIP_5792_RPC_METHODS } from '@/src/utils/EIP5792Utils'

export function EthersGetCallsStatusTest({ callsHash }: { callsHash: string }) {
  const [isLoading, setLoading] = useState(false)
  const [batchCallId, setBatchCallId] = useState(callsHash)

  const { chainId } = useAppKitNetwork()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider<Provider>('eip155')
  const toast = useChakraToast()

  const { isMethodSupported } = useEthersActiveCapabilities()

  useEffect(() => {
    setBatchCallId(callsHash)
  }, [callsHash])

  async function onGetCallsStatus() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      if (!chainId) {
        throw Error('chain not selected')
      }
      if (!batchCallId) {
        throw Error('call id not valid')
      }
      const provider = new BrowserProvider(walletProvider, chainId)
      const batchCallsStatus = await provider.send(EIP_5792_RPC_METHODS.WALLET_GET_CALLS_STATUS, [
        batchCallId as GetCallsStatusParams
      ])
      toast({
        title: 'Success',
        description: JSON.stringify(batchCallsStatus),
        type: 'success'
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to get call status',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected || !address || !walletProvider) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (!isMethodSupported(EIP_5792_RPC_METHODS.WALLET_GET_CALLS_STATUS)) {
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
        data-testid="get-calls-status-button"
        onClick={onGetCallsStatus}
        isDisabled={isLoading}
      >
        Get Calls Status
      </Button>
    </Stack>
  )
}
