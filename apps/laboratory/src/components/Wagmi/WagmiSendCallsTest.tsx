import { Button, Stack, Text } from '@chakra-ui/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, useConnections } from 'wagmi'
import { useSendCalls } from 'wagmi/experimental'
import { useCallback, useState, useEffect } from 'react'
import { useChakraToast } from '../Toast'
import { parseGwei, type Address } from 'viem'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { EIP_5792_RPC_METHODS, getCapabilitySupportedChainInfoForEthers } from '../../utils/EIP5792Utils'

const TEST_TX_1 = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.001')
}
const TEST_TX_2 = {
  to: vitalikEthAddress as Address,
  data: '0xdeadbeef' as `0x${string}`
}

export function WagmiSendCallsTest() {
  const [provider, setProvider] = useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()
  const [isLoading, setLoading] = useState(false)
  const { status, chain, address } = useAccount()
  const connection = useConnections()
  const isConnected = status === 'connected'
  const toast = useChakraToast()

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

  function isSendCallsSupported(): boolean {
    return Boolean(
      provider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(
        EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
      )
    )
  }

  useEffect(() => {
    async function fetchProvider() {
      const connectedProvider = await connection?.[0]?.connector?.getProvider()
      const ethereumProvider = connectedProvider as Awaited<
        ReturnType<(typeof EthereumProvider)['init']>
      >
      setProvider(ethereumProvider)
    }

    if (status === 'connected') {
      fetchProvider()
    }
  }, [status, connection])

  if (status !== 'connected' || !provider) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }

  if (!isSendCallsSupported()) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet do not support this feature
      </Text>
    )
  }

  const allowedChains = getCapabilitySupportedChainInfoForEthers('atomicBatch',provider, address)

  if (allowedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account do not support this feature
      </Text>
    )
  }

  return allowedChains.find(chainInfo => chainInfo.chainId === Number(chain?.id)) && address ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendCalls}
        disabled={!sendCalls}
        isDisabled={isLoading || !isConnected}
      >
        Send Batch Calls to Vitalik
      </Button>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {allowedChains.map(ci => ci.chainName).join(', ')} to test this feature
    </Text>
  )
}
