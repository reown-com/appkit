import { useCallback, useState } from 'react'

import { Button, Heading, Stack, Text } from '@chakra-ui/react'
import { type WalletCapabilities, parseGwei, toHex } from 'viem'
import { useAccount } from 'wagmi'
import { useSendCalls } from 'wagmi/experimental'

import type { Address } from '@reown/appkit-common'
import { useAppKitAccount } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { useCapabilities } from '@/src/hooks/useCapabilities'
import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'
import { vitalikEthAddress } from '@/src/utils/DataUtil'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES } from '@/src/utils/EIP5792Utils'

const TEST_TX_1 = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.0001')
}
const TEST_TX_2 = {
  to: vitalikEthAddress as Address,
  data: '0xdeadbeef' as Address
}

export function WagmiSendCallsTest({ capabilities }: { capabilities: WalletCapabilities }) {
  const { chain } = useAccount()
  const { isSupported, supportedChains, supportedChainsName } = useCapabilities({
    capabilities,
    capability: WALLET_CAPABILITIES.ATOMIC_BATCH,
    chainId: chain?.id ? toHex(chain.id) : undefined
  })

  const { isMethodSupported } = useWagmiAvailableCapabilities()

  const { address } = useAppKitAccount({ namespace: 'eip155' })
  const { status } = useAccount()

  const isConnected = status === 'connected'

  if (!isConnected || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }

  if (!isMethodSupported(EIP_5792_RPC_METHODS.WALLET_SEND_CALLS)) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support the "wallet_sendCalls" RPC method
      </Text>
    )
  }

  if (supportedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account does not support the atomic batch feature
      </Text>
    )
  }

  if (!isSupported) {
    return (
      <Text fontSize="md" color="yellow">
        Switch to {supportedChainsName} to test this feature
      </Text>
    )
  }

  return <ConnectedTestContent />
}

function ConnectedTestContent() {
  const toast = useChakraToast()
  const [lastCallsBatchId, setLastCallsBatchId] = useState<string | null>(null)

  const { sendCalls, isPending: isLoading } = useSendCalls({
    mutation: {
      onSuccess: hash => {
        setLastCallsBatchId(hash.id)
        toast({
          title: 'SendCalls Success',
          description: hash.id,
          type: 'success'
        })
      },
      onError: () => {
        toast({
          title: 'SendCalls Error',
          description: 'Failed to send calls',
          type: 'error'
        })
      }
    }
  })
  const onSendCalls = useCallback(() => {
    sendCalls({
      calls: [TEST_TX_1, TEST_TX_2]
    })
  }, [sendCalls])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-testid="send-calls-button"
        onClick={onSendCalls}
        disabled={!sendCalls}
        isDisabled={isLoading}
        isLoading={isLoading}
      >
        Send Batch Calls to Vitalik
      </Button>
      <>
        <Heading size="xs">Last batch call ID:</Heading>
        <Text data-testid="send-calls-id">{lastCallsBatchId}</Text>
      </>
    </Stack>
  )
}
