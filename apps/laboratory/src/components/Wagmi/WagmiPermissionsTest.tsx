import { Button, Stack, Text } from '@chakra-ui/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, type Connector } from 'wagmi'
import { useCallback, useState, useEffect } from 'react'
import { useChakraToast } from '../Toast'
import { parseGwei, type Address, type Chain } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'

export function WagmiPermissionsTest() {
  const [ethereumProvider, setEthereumProvider] =
    useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()

  const [isLoading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState()
  const { status, chain, address, connector } = useAccount()
  const toast = useChakraToast()

  const isConnected = status === 'connected'

  useEffect(() => {
    if (isConnected && connector && address && chain) {
      fetchProviderAndAccountCapabilities(address, connector, chain)
    }
  }, [isConnected, connector, address])

  const onRequestPermissions = useCallback(() => {
    setLoading(true)

    setLoading(false)
  }, [])

  const onClearPermissions = useCallback(() => {
    setLoading(true)

    setLoading(false)
  }, [])

  const onPurchaseDonut = useCallback(() => {
    setLoading(true)

    setLoading(false)
  }, [])

  function isGrantPermissionsSupported(): boolean {
    return Boolean(
      ethereumProvider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(
        EIP_7715_RPC_METHODS.WALLET_GRANT_PERMISSIONS
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
    }
  }

  if (!isConnected || !ethereumProvider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (!isGrantPermissionsSupported()) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support wallet_grantPermissions rpc method
      </Text>
    )
  }

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="send-calls-button"
        onClick={onRequestPermissions}
        disabled={permissions}
        isDisabled={isLoading}
      >
        Request Permissions
      </Button>
      <Button
        data-test-id="send-calls-button"
        onClick={onClearPermissions}
        disabled={!permissions}
        isDisabled={isLoading}
      >
        Clear Permissions
      </Button>
      <Button
        data-test-id="send-calls-button"
        onClick={onPurchaseDonut}
        disabled={!permissions}
        isDisabled={isLoading}
      >
        Purchase Crypto Donut
      </Button>
    </Stack>
  )
}
