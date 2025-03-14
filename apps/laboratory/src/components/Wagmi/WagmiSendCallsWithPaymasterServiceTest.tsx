import { useCallback, useMemo, useState } from 'react'

import { Button, Input, Stack, Text, Tooltip } from '@chakra-ui/react'
import { encodeFunctionData, parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { useSendCalls } from 'wagmi/experimental'

import { useAppKitAccount } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'
import {
  abi as donutContractAbi,
  donutContractSupportedChains,
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
  to: donutContractaddress as `0x${string}`,
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

export function WagmiSendCallsWithPaymasterServiceTest() {
  const {
    provider,
    supportedChains: capabilitySupportedChains,
    currentChainsInfo,
    supported
  } = useWagmiAvailableCapabilities({
    capability: WALLET_CAPABILITIES.PAYMASTER_SERVICE,
    method: EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
  })

  const { address } = useAppKitAccount({ namespace: 'eip155' })
  const { status } = useAccount()

  const isConnected = status === 'connected'
  const isFeatureSupported = useMemo(
    () =>
      currentChainsInfo &&
      donutContractSupportedChains.some(chain => chain.id === currentChainsInfo.chainId),
    [currentChainsInfo]
  )

  const doWalletSupportCapability = useMemo(
    () =>
      currentChainsInfo &&
      capabilitySupportedChains.some(chain => chain.chainId === currentChainsInfo.chainId),
    [capabilitySupportedChains]
  )

  if (!isConnected || !provider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }

  if (!supported) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support "wallet_sendCalls" RPC method
      </Text>
    )
  }

  if (!isFeatureSupported) {
    return (
      <Text fontSize="md" color="yellow">
        Switch to {donutContractSupportedChainsName} to test this feature
      </Text>
    )
  }

  if (!doWalletSupportCapability) {
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

    return contexts[paymasterProvider || '']
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
          placeholder="http://api.pimlico.io/v2/sepolia/rpc?apikey=..."
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
