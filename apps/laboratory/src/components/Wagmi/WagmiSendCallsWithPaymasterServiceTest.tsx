import { useCallback, useMemo, useState } from 'react'

import { Button, Input, Stack, Text, Tooltip } from '@chakra-ui/react'
import { type WalletCapabilities, encodeFunctionData, parseEther, toHex } from 'viem'
import { useAccount } from 'wagmi'
import { useSendCalls } from 'wagmi'

import type { Address } from '@reown/appkit-common'
import { useAppKitAccount } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { useCapabilities } from '@/src/hooks/useCapabilities'
import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'
import {
  abi as donutContractAbi,
  donutContractSupportedChainsName,
  address as donutContractaddress
} from '@/src/utils/DonutContract'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES } from '@/src/utils/EIP5792Utils'

const purchaseDonutCallData = encodeFunctionData({
  abi: donutContractAbi,
  functionName: 'purchase',
  args: [1]
})

const TEST_TX = {
  to: donutContractaddress as Address,
  value: parseEther('0.00001'),
  data: purchaseDonutCallData
}

const BICONOMY_PAYMASTER_CONTEXT = {
  mode: 'SPONSORED',
  calculateGasLimits: false,
  expiryDuration: 300,
  sponsorshipInfo: {
    webhookData: {},
    smartAccountInfo: {
      name: 'SAFE',
      version: '1.4.1'
    }
  }
}

export function WagmiSendCallsWithPaymasterServiceTest({
  capabilities
}: {
  capabilities: WalletCapabilities
}) {
  const { chain } = useAccount()
  const { isMethodSupported } = useWagmiAvailableCapabilities()
  const { isSupported, currentChainsInfo, supportedChains } = useCapabilities({
    capabilities,
    capability: WALLET_CAPABILITIES.PAYMASTER_SERVICE,
    chainId: chain?.id ? toHex(chain.id) : undefined
  })

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
        Switch to {donutContractSupportedChainsName} to test this feature
      </Text>
    )
  }

  if (!isSupported) {
    return (
      <Text fontSize="md" color="yellow">
        Account does not support paymaster service feature on {currentChainsInfo?.chainName}
      </Text>
    )
  }

  return <AvailableTestContent />
}

function AvailableTestContent() {
  const [paymasterProvider, setPaymasterProvider] = useState<string>()
  const [reownPolicyId, setReownPolicyId] = useState<string>('')
  const [paymasterServiceUrl, setPaymasterServiceUrl] = useState<string>('')
  const [isLoading, setLoading] = useState(false)
  const toast = useChakraToast()
  const context = useMemo(() => {
    const contexts: Record<string, unknown> = {
      biconomy: BICONOMY_PAYMASTER_CONTEXT,
      reown: {
        policyId: reownPolicyId
      }
    }

    return contexts[paymasterProvider || ''] as Record<string, unknown>
  }, [paymasterProvider])

  function onPaymasterUrlChange(url: string) {
    setPaymasterServiceUrl(url)

    const match = url.match(/pimlico|biconomy|reown/u)
    if (match?.[0]) {
      setPaymasterProvider(match?.[0])
    }
  }

  const { sendCalls } = useSendCalls({
    mutation: {
      onSuccess: hash => {
        setLoading(false)
        toast({
          title: 'SendCalls Success',
          description: hash.id,
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
      calls: [TEST_TX],
      capabilities: {
        paymasterService: {
          url: paymasterServiceUrl,
          context
        }
      }
    })
  }, [sendCalls, paymasterServiceUrl])

  return (
    <Stack direction={['column', 'column', 'column']}>
      <Tooltip label="Paymaster Service URL should be of ERC-7677 paymaster service proxy">
        <Input
          placeholder="https://paymaster-api.reown.com/11155111/rpc?projectId=..."
          onChange={e => onPaymasterUrlChange(e.target.value)}
          value={paymasterServiceUrl}
          isDisabled={isLoading}
          whiteSpace="nowrap"
          textOverflow="ellipsis"
        />
      </Tooltip>
      {
        <Input
          placeholder="Reown Policy ID (Optional)"
          onChange={e => setReownPolicyId(e.target.value)}
          value={reownPolicyId}
          isDisabled={isLoading}
          whiteSpace="nowrap"
          textOverflow="ellipsis"
        />
      }
      <Button
        width={'fit-content'}
        data-testid="send-calls-paymaster-service-button"
        onClick={onSendCalls}
        disabled={!sendCalls}
        isDisabled={isLoading || !paymasterServiceUrl}
      >
        SendCalls w/ Paymaster Service
      </Button>
    </Stack>
  )
}
