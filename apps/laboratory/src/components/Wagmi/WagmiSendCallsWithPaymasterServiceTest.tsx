import { Button, Input, Stack, Text, Tooltip } from '@chakra-ui/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, type Connector } from 'wagmi'
import { useSendCalls } from 'wagmi/experimental'
import { useCallback, useState, useEffect } from 'react'
import { useChakraToast } from '../Toast'
import { parseGwei, type Address, type WalletCapabilities } from 'viem'
import { type Chain } from 'wagmi/chains'
import { vitalikEthAddress } from '../../utils/DataUtil'
import {
  getFilteredCapabilitySupportedChainInfo,
  EIP_5792_RPC_METHODS,
  WALLET_CAPABILITIES,
  getProviderCachedCapabilities
} from '../../utils/EIP5792Utils'

const TEST_TX_1 = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.001')
}
const TEST_TX_2 = {
  to: vitalikEthAddress as Address,
  data: '0xdeadbeef' as `0x${string}`
}

export function WagmiSendCallsWithPaymasterServiceTest() {
  const [ethereumProvider, setEthereumProvider] =
    useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()
  const [availableCapabilities, setAvailableCapabilities] = useState<
    Record<number, WalletCapabilities> | undefined
  >()
  const [paymasterServiceUrl, setPaymasterServiceUrl] = useState<string>('')
  const [isLoading, setLoading] = useState(false)
  const { status, chain, address, connector } = useAccount()
  const toast = useChakraToast()

  const isConnected = status === 'connected'
  const paymasterServiceSupportedChains = availableCapabilities
    ? getFilteredCapabilitySupportedChainInfo(
        WALLET_CAPABILITIES.PAYMASTER_SERVICE,
        availableCapabilities
      )
    : []
  const paymasterServiceSupportedChainNames = paymasterServiceSupportedChains
    .map(ci => ci.chainName)
    .join(', ')
  const currentChainsInfo = paymasterServiceSupportedChains.find(
    chainInfo => chainInfo.chainId === Number(chain?.id)
  )

  useEffect(() => {
    if (isConnected && connector && address && chain) {
      fetchProviderAndAccountCapabilities(address, connector, chain)
    }
  }, [isConnected, connector, address])
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
      calls: [TEST_TX_1, TEST_TX_2],
      capabilities: {
        paymasterService: {
          url: paymasterServiceUrl
        }
      }
    })
  }, [sendCalls, paymasterServiceUrl])

  function isSendCallsSupported(): boolean {
    return Boolean(
      ethereumProvider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(
        EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
      )
    )
  }

  async function fetchProviderAndAccountCapabilities(
    connectedAccount: `0x${string}`,
    connectedConnector: Connector,
    connectedChain: Chain
  ) {
    const connectedProvider = await connectedConnector.getProvider({
      chainId: connectedChain.id
    })
    if (connectedProvider instanceof EthereumProvider) {
      setEthereumProvider(connectedProvider)
      let walletCapabilities = undefined
      walletCapabilities = getProviderCachedCapabilities(connectedAccount, connectedProvider)
      setAvailableCapabilities(walletCapabilities)
    }
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
  if (paymasterServiceSupportedChains.length === 0) {
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
          placeholder="http://api.pimlico.io/v2/sepolia/rpc?apikey=..."
          onChange={e => setPaymasterServiceUrl(e.target.value)}
          value={paymasterServiceUrl}
          isDisabled={isLoading}
          whiteSpace="nowrap"
          textOverflow="ellipsis"
        />
      </Tooltip>
      <Button
        width={'fit-content'}
        data-test-id="send-calls-paymaster-service-button"
        onClick={onSendCalls}
        disabled={!sendCalls}
        isDisabled={isLoading || !paymasterServiceUrl}
      >
        SendCalls w/ Paymaster Service
      </Button>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {paymasterServiceSupportedChainNames} to test this feature
    </Text>
  )
}
