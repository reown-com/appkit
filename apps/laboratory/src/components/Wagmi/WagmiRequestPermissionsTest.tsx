import { Button, Stack, Text } from '@chakra-ui/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, type Connector } from 'wagmi'
import { type Chain } from 'wagmi/chains'
import { walletActionsErc7715 } from 'viem/experimental'
import { useCallback, useState, useEffect } from 'react'
import { useChakraToast } from '../Toast'
import { createPublicClient, custom, parseEther } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'
import { useLocalSigner } from '../../hooks/useLocalSigner'
import { bigIntReplacer, encodeSecp256k1PublicKeyToDID } from '../../utils/CommonUtils'
import { useGrantedPermissions } from '../../hooks/useGrantedPermissions'

export function WagmiRequestPermissionsTest() {
  const { status, chain, address, connector } = useAccount()

  const { signer } = useLocalSigner()
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const { grantedPermissions, setGrantedPermissions } = useGrantedPermissions()

  const [ethereumProvider, setEthereumProvider] =
    useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()

  const toast = useChakraToast()

  const isConnected = status === 'connected'

  useEffect(() => {
    if (isConnected && connector && address && chain) {
      fetchProviderAndAccountCapabilities(connector, chain).then(provider => {
        setEthereumProvider(provider)
      })
    }
  }, [isConnected, connector, address])

  const onRequestPermissions = useCallback(async () => {
    setRequestPermissionLoading(true)
    if (!ethereumProvider) {
      setRequestPermissionLoading(false)

      return
    }
    try {
      const targetPublicKey = signer?.publicKey
      if (!targetPublicKey) {
        throw new Error('Local signer not initialized')
      }
      const publicClient = createPublicClient({
        chain,
        transport: custom(ethereumProvider)
      }).extend(walletActionsErc7715())

      const permissions = await publicClient.grantPermissions({
        expiry: Date.now() + 24 * 60 * 60,
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
      if (permissions) {
        setGrantedPermissions(permissions)
        setRequestPermissionLoading(false)
        toast({
          type: 'success',
          title: 'Permissions Granted',
          description: JSON.stringify(permissions, bigIntReplacer)
        })

        return
      }
      toast({ title: 'Error', description: 'Failed to obtain permissions' })
    } catch (error) {
      toast({
        type: 'error',
        title: 'Permissions Erros',
        description: error instanceof Error ? error.message : 'Some error occurred'
      })
    }
    setRequestPermissionLoading(false)
  }, [ethereumProvider, signer])

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
      return connectedProvider
    }

    return undefined
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
        isDisabled={Boolean(
          isRequestPermissionLoading || Boolean(grantedPermissions) || !isConnected
        )}
        isLoading={isRequestPermissionLoading}
      >
        Request Permissions
      </Button>
      <Button
        data-test-id="clear-permissions-button"
        onClick={onClearPermissions}
        isDisabled={!grantedPermissions}
      >
        Clear Permissions
      </Button>
    </Stack>
  )
}
