import { useState } from 'react'

import { Button, Heading, Spacer, Stack, Text } from '@chakra-ui/react'
import { ethers } from 'ethers5'
import { type WalletCapabilities, toHex } from 'viem'

import type { Provider as RawProvider } from '@reown/appkit'
import type { Address, Hex } from '@reown/appkit-common'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { useCapabilities } from '@/src/hooks/useCapabilities'
import { useEthersActiveCapabilities } from '@/src/hooks/useEthersActiveCapabilities'
import { vitalikEthAddress } from '@/src/utils/DataUtil'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES } from '@/src/utils/EIP5792Utils'

export function Ethers5SendCallsTest({ capabilities }: { capabilities: WalletCapabilities }) {
  const [loading, setLoading] = useState(false)

  const { chainId } = useAppKitNetwork()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider<RawProvider>('eip155')
  const toast = useChakraToast()
  const [lastCallsBatchId, setLastCallsBatchId] = useState<string | null>(null)

  const { isMethodSupported } = useEthersActiveCapabilities()
  const { currentChainsInfo, supportedChains, supportedChainsName } = useCapabilities({
    capabilities,
    capability: WALLET_CAPABILITIES.ATOMIC_BATCH,
    chainId: chainId ? toHex(chainId) : undefined
  })
  async function onSendCalls() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      if (!chainId) {
        throw Error('chain not selected')
      }
      const provider = new ethers.providers.Web3Provider(walletProvider, chainId)
      const calls = [
        {
          to: vitalikEthAddress as Address,
          data: '0x' as Hex,
          value: `0x0`
        },
        {
          to: vitalikEthAddress as Address,
          value: '0x00',
          data: '0xdeadbeef'
        }
      ]
      const sendCallsParams = {
        version: '1.0',
        chainId: `0x${BigInt(chainId).toString(16)}`,
        from: address,
        calls
      }
      const batchCallHash = await provider.send(EIP_5792_RPC_METHODS.WALLET_SEND_CALLS, [
        sendCallsParams
      ])

      setLastCallsBatchId(batchCallHash)
      toast({
        title: 'Success',
        description: batchCallHash,
        type: 'success'
      })
    } catch {
      toast({
        title: 'SendCalls Error',
        description: 'Failed to send calls',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected || !walletProvider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (!isMethodSupported(EIP_5792_RPC_METHODS.WALLET_SEND_CALLS)) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support wallet_sendCalls rpc
      </Text>
    )
  }
  if (supportedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account does not support atomic batch feature
      </Text>
    )
  }

  return currentChainsInfo ? (
    <Stack direction={['column', 'column']}>
      <Button
        data-testid="send-calls-button"
        onClick={onSendCalls}
        isDisabled={loading}
        maxWidth={'50%'}
      >
        Send Batch Calls to Vitalik
      </Button>
      <Spacer />
      {lastCallsBatchId && (
        <>
          <Heading size="xs">Last batch call ID:</Heading>
          <Text data-testid="send-calls-id">{lastCallsBatchId}</Text>
        </>
      )}
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {supportedChainsName} to test atomic batch feature
    </Text>
  )
}
