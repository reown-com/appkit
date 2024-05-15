import { Button, Menu, MenuButton, MenuItem, MenuList, Stack, Text } from '@chakra-ui/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, useConnections } from 'wagmi'
import { useCapabilities, useSendCalls } from 'wagmi/experimental'
import { useCallback, useState, useEffect } from 'react'
import { useChakraToast } from '../Toast'
import { parseGwei, type Address } from 'viem'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { EIP_5792_RPC_METHODS, getCapabilitySupportedChainInfoForViem } from '../../utils/EIP5792Utils'

const TEST_TX_1 = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.001')
}
const TEST_TX_2 = {
  to: vitalikEthAddress as Address,
  data: '0xdeadbeef' as `0x${string}`
}

const paymasterServiceOptions: {
  value: string
  label: string
}[] = [{ value: 'http://localhost:3000/api/paymaster/pimlico', label: 'Pimlico Paymaster' }]

export function WagmiSendCallsWithPaymasterServiceTest() {
  const [ethereumProvider, setEthereumProvider] =
    useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()
  const [isLoading, setLoading] = useState(false)
  const { status, chain, address } = useAccount()
  const { data: availableCapabilities } = useCapabilities({
    account: address
  })
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string }>()
  const connection = useConnections()
  const isConnected = status === 'connected'
  const toast = useChakraToast()

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
          title: 'Error',
          description: 'Failed to send calls',
          type: 'error'
        })
      }
    }
  })

  const onSendCalls = useCallback(() => {
    setLoading(true)
    sendCalls({
      calls: [TEST_TX_1, TEST_TX_2],
      capabilities: {
        paymasterService: {
          url: selectedOption?.value
        }
      }
    })
  }, [sendCalls])

  function isSendCallsSupported(): boolean {
    return Boolean(
      ethereumProvider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(
        EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
      )
    )
  }

  async function fetchProvider() {
    const connectedProvider = await connection?.[0]?.connector?.getProvider()
    if (connectedProvider instanceof EthereumProvider) {
      setEthereumProvider(connectedProvider)
    }
  }
  useEffect(() => {
    if (isConnected) {
      fetchProvider()
    }
  }, [isConnected])

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

  const paymasterServiceSupportedChains = availableCapabilities
    ? getCapabilitySupportedChainInfoForViem('paymasterService', availableCapabilities)
    : []

  if (paymasterServiceSupportedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account does not support paymaster service feature
      </Text>
    )
  }

  return paymasterServiceSupportedChains.find(
    chainInfo => chainInfo.chainId === Number(chain?.id)
  ) ? (
    <Stack direction={['column', 'column', 'row']}>
      <Menu>
        <MenuButton as={Button} colorScheme="blue">
          {selectedOption?.label || 'Select Paymaster'}
        </MenuButton>
        <MenuList>
          {paymasterServiceOptions.map((option, i) => (
            <MenuItem key={i} onClick={() => setSelectedOption(option)}>
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Button
        data-test-id="send-calls-paymaster-service-button"
        onClick={onSendCalls}
        disabled={!sendCalls}
        isDisabled={isLoading || !selectedOption}
      >
        SendCalls to Vitalik With Paymaster Service
      </Button>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {paymasterServiceSupportedChains.map(ci => ci.chainName).join(', ')} to test this
      feature
    </Text>
  )
}
