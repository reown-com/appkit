import { useState } from 'react'

import { Button, Input, Stack, Text } from '@chakra-ui/react'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { ethers } from 'ethers5'

import { W3mFrameProvider } from '@reown/appkit-wallet'
import {
  type Provider,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider
} from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { type GetCallsStatusParams } from '@/src/types/EIP5792'
import { EIP_5792_RPC_METHODS } from '@/src/utils/EIP5792Utils'

export function Ethers5GetCallsStatusTest() {
  const [isLoading, setLoading] = useState(false)
  const [batchCallId, setBatchCallId] = useState('')

  const { chainId } = useAppKitNetwork()
  const { isConnected, address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('eip155')

  const toast = useChakraToast()

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
      const provider = new ethers.providers.Web3Provider(walletProvider, chainId)
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
  function isGetCallsStatusSupported(): boolean {
    // We are currently checking capabilities above. We should use those capabilities instead of this check.
    if (walletProvider instanceof W3mFrameProvider) {
      return true
    }
    if (walletProvider instanceof UniversalProvider) {
      return Boolean(
        walletProvider?.session?.namespaces?.['eip155']?.methods?.includes(
          EIP_5792_RPC_METHODS.WALLET_GET_CALLS_STATUS
        )
      )
    }

    return false
  }

  if (!isConnected || !address || !walletProvider) {
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
        data-testid="get-calls-status-button"
        onClick={onGetCallsStatus}
        isDisabled={isLoading}
      >
        Get Calls Status
      </Button>
    </Stack>
  )
}
