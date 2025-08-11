import { useState } from 'react'

import { Button, Input, Stack, Text, Tooltip } from '@chakra-ui/react'
import { ethers } from 'ethers5'
import { type WalletCapabilities, parseGwei, toHex } from 'viem'

import {
  type Provider,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider
} from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { useCapabilities } from '@/src/hooks/useCapabilities'
import { useEthersActiveCapabilities } from '@/src/hooks/useEthersActiveCapabilities'
import { vitalikEthAddress } from '@/src/utils/DataUtil'
import { abi, address as donutAddress } from '@/src/utils/DonutContract'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES } from '@/src/utils/EIP5792Utils'

export function Ethers5SendCallsWithPaymasterServiceTest({
  capabilities
}: {
  capabilities: WalletCapabilities
}) {
  const [paymasterServiceUrl, setPaymasterServiceUrl] = useState<string>('')
  const [isLoading, setLoading] = useState(false)

  const { chainId } = useAppKitNetwork()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider<Provider>('eip155')
  const toast = useChakraToast()

  const { isMethodSupported } = useEthersActiveCapabilities()
  const { currentChainsInfo, supportedChains, supportedChainsName } = useCapabilities({
    capabilities,
    capability: WALLET_CAPABILITIES.PAYMASTER_SERVICE,
    chainId: chainId ? toHex(chainId) : undefined
  })

  async function onSendCalls(donut?: boolean) {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      if (!chainId) {
        throw Error('chain not selected')
      }

      if (!paymasterServiceUrl) {
        throw Error('paymasterServiceUrl not set')
      }
      const provider = new ethers.providers.Web3Provider(walletProvider, chainId)
      const amountToSend = parseGwei('0.001').toString(16)
      const donutIntrerface = new ethers.utils.Interface(abi)
      const encodedCallData = donutIntrerface.encodeFunctionData('getBalance', [address])

      const calls = donut
        ? [
            {
              to: donutAddress,
              data: encodedCallData
            }
          ]
        : [
            {
              to: vitalikEthAddress,
              value: `0x${amountToSend}`
            },
            {
              to: vitalikEthAddress,
              data: '0xdeadbeef'
            }
          ]

      const sendCallsParams = {
        version: '1.0',
        chainId: `0x${BigInt(chainId).toString(16)}`,
        from: address,
        calls,
        capabilities: {
          paymasterService: {
            url: paymasterServiceUrl
          }
        }
      }
      const batchCallHash = await provider.send(EIP_5792_RPC_METHODS.WALLET_SEND_CALLS, [
        sendCallsParams
      ])
      toast({
        title: 'SendCalls Success',
        description: batchCallHash,
        type: 'success'
      })
    } catch {
      toast({
        title: 'Error',
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
        Account does not support paymaster service feature
      </Text>
    )
  }

  return currentChainsInfo ? (
    <Stack direction={['column', 'column', 'column']}>
      <Tooltip label="Paymaster Service URL should be of ERC-7677 paymaster service proxy">
        <Input
          placeholder="https://paymaster-api.reown.com/11155111/rpc?projectId=..."
          onChange={e => setPaymasterServiceUrl(e.target.value)}
          value={paymasterServiceUrl}
          isDisabled={isLoading}
          whiteSpace="nowrap"
          textOverflow="ellipsis"
        />
      </Tooltip>
      <Button
        width={'fit-content'}
        data-testid="send-calls-paymaster-service-button"
        onClick={() => onSendCalls()}
        isDisabled={isLoading || !paymasterServiceUrl}
      >
        SendCalls w/ Paymaster Service
      </Button>
      <Button
        width={'fit-content'}
        data-testid="send-calls-paymaster-service-button"
        onClick={() => onSendCalls(true)}
        isDisabled={isLoading || !paymasterServiceUrl}
      >
        Send Donut Calls w/ Paymaster Service
      </Button>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {supportedChainsName} to test paymaster service feature
    </Text>
  )
}
