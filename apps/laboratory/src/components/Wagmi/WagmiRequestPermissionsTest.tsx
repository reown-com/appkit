import { Button, Stack, Text } from '@chakra-ui/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, type Connector } from 'wagmi'
import { type Chain } from 'wagmi/chains'
import { type GrantPermissionsReturnType } from 'viem/experimental'
import { walletActionsErc7715 } from 'viem/experimental'
import { useCallback, useState, useEffect } from 'react'
import { useChakraToast } from '../Toast'
import { createWalletClient, custom, parseEther } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'
import { GRANTED_PERMISSIONS_KEY } from '../../utils/LocalStorage'
import { useLocalSigner } from '../../hooks/useLocalSigner'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import { sepolia } from 'viem/chains'
import { encodeSecp256k1PublicKeyToDID } from '../../utils/CommonUtils'

export function WagmiRequestPermissionsTest() {
  const { status, chain, address, connector } = useAccount()

  const { signer } = useLocalSigner()
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const [grantedPermissions, setGrantedPermissions] = useLocalStorageState<
    GrantPermissionsReturnType | undefined
  >(GRANTED_PERMISSIONS_KEY, undefined)

  const [ethereumProvider, setEthereumProvider] =
    useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()

  const toast = useChakraToast()

  const isConnected = status === 'connected'

  useEffect(() => {
    if (isConnected && connector && address && chain) {
      fetchProviderAndAccountCapabilities(connector, chain)
    }
  }, [isConnected, connector, address])

  const onRequestPermissions = useCallback(async () => {
    setRequestPermissionLoading(true)
    if (!ethereumProvider) {
      return
    }
    try {
      const targetPublicKey = signer?.publicKey
      if (!targetPublicKey) {
        throw new Error('Local signer not initialized')
      }
      const _walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(ethereumProvider)
      }).extend(walletActionsErc7715())

      const grantPermissionsResponse = await _walletClient.grantPermissions({
        expiry: 1716846083638,
        permissions: [
          {
            type: 'native-token-transfer',
            data: {
              ticker: 'ETH'
            },
            policies: [
              {
                type: 'token-allowance',
                data: {
                  allowance: parseEther('1')
                }
              }
            ]
          }
        ],
        signer: {
          type: 'key',
          data: {
            id: encodeSecp256k1PublicKeyToDID(targetPublicKey)
          }
        }
      })
      if (grantPermissionsResponse) {
        setGrantedPermissions(grantPermissionsResponse)
        setRequestPermissionLoading(false)
        toast({ title: 'Success', description: 'Permissions granted successfully' })

        return
      }
      toast({ title: 'Error', description: 'Failed to obtain permissions' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to obtain permissions'
      })
    }
    setRequestPermissionLoading(false)
  }, [])

  const onClearPermissions = useCallback(() => {
    setGrantedPermissions(undefined)
  }, [])

  function isGrantPermissionsSupported(): boolean {
    return Boolean(
      ethereumProvider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(
        EIP_7715_RPC_METHODS.WALLET_GRANT_PERMISSIONS
      )
    )
  }

  async function fetchProviderAndAccountCapabilities(
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
        data-test-id="request-permissions-button"
        onClick={onRequestPermissions}
        disabled={isRequestPermissionLoading || grantedPermissions !== undefined || !isConnected}
      >
        Request Permissions
      </Button>
      <Button
        data-test-id="clear-permissions-button"
        onClick={onClearPermissions}
        disabled={!grantedPermissions}
      >
        Clear Permissions
      </Button>
    </Stack>
  )
}
