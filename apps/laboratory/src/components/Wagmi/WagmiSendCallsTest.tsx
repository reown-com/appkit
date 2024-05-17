import { Button, Stack, Text } from '@chakra-ui/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, useConnections } from 'wagmi'
import { useCapabilities, useSendCalls } from 'wagmi/experimental'
import { useCallback, useState, useEffect } from 'react'
import { useChakraToast } from '../Toast'
import { parseGwei, type Address, type WalletCapabilities } from 'viem'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { EIP_5792_RPC_METHODS } from '../../utils/EIP5792Utils'
import { getChain } from '../../utils/ChainsUtil'

const TEST_TX_1 = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.001')
}
const TEST_TX_2 = {
  to: vitalikEthAddress as Address,
  data: '0xdeadbeef' as `0x${string}`
}

export function WagmiSendCallsTest() {
  const [ethereumProvider, setEthereumProvider] =
    useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()
  const [isLoading, setLoading] = useState(false)

  const { status, chain, address } = useAccount()
  const { data: availableCapabilities } = useCapabilities({
    account: address
  })
  const connection = useConnections()
  const toast = useChakraToast()

  const isConnected = status === 'connected'
  const atomicBatchSupportedChains = availableCapabilities
    ? getAtomicBatchSupportedChainInfo(availableCapabilities)
    : []
  const atomicBatchSupportedChainsName = atomicBatchSupportedChains
    .map(ci => ci.chainName)
    .join(', ')

  useEffect(() => {
    if (isConnected) {
      fetchProvider()
    }
  }, [isConnected])
  const { sendCalls } = useSendCalls({
    mutation: {
      onSuccess: hash => {
        setLoading(false)
        toast({
          title: 'Transaction Success',
          description: hash,
          type: 'success'
        })
      },
      onError: () => {
        setLoading(false)
        toast({
          title: 'Error',
          description: 'Failed to sign transaction',
          type: 'error'
        })
      }
    }
  })
  const onSendCalls = useCallback(() => {
    setLoading(true)
    sendCalls({
      calls: [TEST_TX_1, TEST_TX_2]
    })
  }, [sendCalls])

  async function fetchProvider() {
    const connectedProvider = await connection?.[0]?.connector?.getProvider()
    if (connectedProvider instanceof EthereumProvider) {
      setEthereumProvider(connectedProvider)
    }
  }
  function isSendCallsSupported(): boolean {
    return Boolean(
      ethereumProvider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(
        EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
      )
    )
  }
  function getAtomicBatchSupportedChainInfo(capabilities: Record<number, WalletCapabilities>): {
    chainId: number
    chainName: string
  }[] {
    const chainIds = Object.keys(capabilities)
    const chainInfo = chainIds
      .filter(chainId => {
        const capabilitiesPerChain = capabilities[parseInt(chainId, 10)]

        return capabilitiesPerChain?.['atomicBatch']?.supported === true
      })
      .map(chainId => {
        const capabilityChain = getChain(parseInt(chainId, 10))

        return {
          chainId: parseInt(chainId, 10),
          chainName: capabilityChain?.name ?? `Unknown Chain(${chainId})`
        }
      })

    return chainInfo
  }

  if (!isConnected || !ethereumProvider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (!isSendCallsSupported()) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support wallet_sendCalls rpc method
      </Text>
    )
  }
  if (atomicBatchSupportedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account does not support atomic batch feature
      </Text>
    )
  }

  return atomicBatchSupportedChains.find(chainInfo => chainInfo.chainId === Number(chain?.id)) ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="send-calls-button"
        onClick={onSendCalls}
        disabled={!sendCalls}
        isDisabled={isLoading}
      >
        Send Batch Calls to Vitalik
      </Button>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {atomicBatchSupportedChainsName} to test this feature
    </Text>
  )
}
