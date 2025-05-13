import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button, Input, Select, Stack, Text, Tooltip } from '@chakra-ui/react'
import { type Abi, encodeFunctionData, parseEther } from 'viem'
import { useAccount, useSwitchChain } from 'wagmi'
import { useSendCalls } from 'wagmi'

import { useAppKitAccount } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES } from '@/src/utils/EIP5792Utils'

function getWriteMethodsFromAbi(abi: string) {
  try {
    const abiJson: Abi = JSON.parse(abi)

    const writeFunctions = abiJson.filter(
      item =>
        item.type === 'function' &&
        (item.stateMutability === 'nonpayable' || item.stateMutability === 'payable')
    )

    return writeFunctions.filter(func => 'name' in func).map(func => func.name)
  } catch (error) {
    return []
  }
}

export function WagmiSendCallsCustomAbiWithPaymasterServiceTest() {
  const {
    provider,
    supported,
    supportedChains: capabilitySupportedChains,
    currentChainsInfo
  } = useWagmiAvailableCapabilities({
    capability: WALLET_CAPABILITIES.PAYMASTER_SERVICE,
    method: EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
  })

  const { address } = useAppKitAccount({ namespace: 'eip155' })
  const { status } = useAccount()

  const isConnected = status === 'connected'

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
  const { switchChain } = useSwitchChain()
  const { address } = useAppKitAccount({ namespace: 'eip155' })
  const [paymasterProvider, setPaymasterProvider] = useState<string>()
  const [reownPolicyId, setReownPolicyId] = useState<string>('')
  const [contractAbi, setContractAbi] = useState<string>('')
  const [method, setMethod] = useState<string>('')
  const [methodArgs, setMethodArgs] = useState<string>('')
  const [valueToSend, setValueToSend] = useState<string>('')
  const [contractAddress, setContractAddress] = useState<string>('')
  const [paymasterServiceUrl, setPaymasterServiceUrl] = useState<string>('')
  const [isLoading, setLoading] = useState(false)
  const toast = useChakraToast()

  const [availableMethods, setAvailableMethods] = useState<Array<string>>([])

  useEffect(() => {
    setAvailableMethods(getWriteMethodsFromAbi(contractAbi))
  }, [contractAbi])

  const context = useMemo(() => {
    const contexts: Record<string, unknown> = {
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

    let abi: Abi = []
    try {
      abi = JSON.parse(contractAbi)
      if (!Array.isArray(abi)) {
        throw new Error()
      }
    } catch (e) {
      setLoading(false)
      toast({
        title: 'SendCalls Error',
        description: 'Provided ABI not a valid JSON array.',
        type: 'error'
      })

      return
    }

    let args: Array<unknown> = []
    try {
      args = JSON.parse(methodArgs)
      if (!Array.isArray(args)) {
        throw new Error()
      }
    } catch (e) {
      setLoading(false)
      toast({
        title: 'SendCalls Error',
        description: 'Provided method args not a valid JSON array.',
        type: 'error'
      })

      return
    }

    const value: bigint | undefined = Number.isNaN(parseFloat(valueToSend))
      ? undefined
      : parseEther(valueToSend)

    const callData = encodeFunctionData({
      abi,
      functionName: method,
      args
    })

    const testTransaction = {
      to: contractAddress as `0x${string}`,
      data: callData,
      value
    }

    sendCalls({
      calls: [testTransaction],
      capabilities: {
        paymasterService: {
          1: {
            url: paymasterServiceUrl,
            context
          }
        }
      }
    })
  }, [
    sendCalls,
    paymasterServiceUrl,
    contractAbi,
    contractAddress,
    methodArgs,
    method,
    valueToSend
  ])

  return (
    <Stack direction={['column', 'column', 'column']}>
      <Input
        placeholder="Contract Address (0x...)"
        onChange={e => setContractAddress(e.target.value)}
        value={contractAddress}
        isDisabled={isLoading}
        whiteSpace="nowrap"
        textOverflow="ellipsis"
      />

      <Input
        placeholder="Contract ABI [...]"
        onChange={e => setContractAbi(e.target.value)}
        value={contractAbi}
        isDisabled={isLoading}
        whiteSpace="nowrap"
        textOverflow="ellipsis"
      />

      <Select
        value={method}
        onChange={e => {
          setMethod(e.target.value)
        }}
        placeholder="Method name"
      >
        {availableMethods.map(name => (
          <option value={name} key={name}>
            {name}
          </option>
        ))}
      </Select>

      <Input
        placeholder="Method args [...]"
        onChange={e => setMethodArgs(e.target.value)}
        value={methodArgs}
        isDisabled={isLoading}
        whiteSpace="nowrap"
        textOverflow="ellipsis"
      />

      <Input
        placeholder="Value (Eg 0.000001) (Optional)"
        onChange={e => setValueToSend(e.target.value)}
        value={valueToSend}
        isDisabled={isLoading}
        whiteSpace="nowrap"
        textOverflow="ellipsis"
      />

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

      <Input
        placeholder="Reown Policy ID (Optional)"
        onChange={e => setReownPolicyId(e.target.value)}
        value={reownPolicyId}
        isDisabled={isLoading}
        whiteSpace="nowrap"
        textOverflow="ellipsis"
      />

      <Button
        width={'fit-content'}
        onClick={() => {
          if (switchChain) {
            // Switch to Base network
            switchChain({ chainId: 8453 })
          }
          // USDC on Base https://basescan.org/token/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913#writeProxyContract
          setContractAddress('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913')
          setContractAbi(
            '[{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]'
          )
          setMethod('transfer')
          setMethodArgs(`["${address}", ${0.1 * 10 ** 6}]`)
        }}
        isDisabled={isLoading}
      >
        Try with USDC on Base
      </Button>

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
