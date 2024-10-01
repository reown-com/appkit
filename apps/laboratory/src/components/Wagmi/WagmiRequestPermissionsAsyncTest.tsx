import { Button, Stack, Text } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { useChakraToast } from '../Toast'
import { toHex, type Address } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'
import {
  useWagmiAvailableCapabilities,
  type Provider
} from '../../hooks/useWagmiActiveCapabilities'
import { useLocalEcdsaKey } from '../../context/LocalEcdsaKeyContext'
import { bigIntReplacer } from '../../utils/CommonUtils'
import { useERC7715Permissions } from '../../hooks/useERC7715Permissions'
import { getPurchaseDonutPermissions } from '../../utils/ERC7715Utils'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import {
  grantPermissions,
  type SmartSessionGrantPermissionsRequest
} from '@reown/appkit-experimental/smart-session'

export function WagmiRequestPermissionsAsyncTest() {
  const { provider, supported } = useWagmiAvailableCapabilities({
    method: EIP_7715_RPC_METHODS.WALLET_GRANT_PERMISSIONS
  })
  const { address, isConnected } = useAppKitAccount()

  const { chainId } = useAppKitNetwork()

  if (!isConnected || !provider || !address || !chainId) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (!supported) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support wallet_grantPermissions rpc method
      </Text>
    )
  }

  return <ConnectedTestContent chainId={chainId} provider={provider} address={address as Address} />
}

function ConnectedTestContent({
  chainId,
  provider,
  address
}: {
  chainId: string | number
  provider: Provider
  address: Address
}) {
  const { clearSmartSessionResponse, setSmartSessionResponse, smartSessionResponse } =
    useERC7715Permissions()
  const { signer } = useLocalEcdsaKey()
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const toast = useChakraToast()
  const onRequestPermissions = useCallback(async () => {
    setRequestPermissionLoading(true)
    try {
      if (!signer) {
        throw new Error('No signer available')
      }
      const purchaseDonutPermissions = getPurchaseDonutPermissions()
      const grantPurchaseDonutPermissions: SmartSessionGrantPermissionsRequest = {
        // Adding 24 hours to the current time
        expiry: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        chainId: toHex(chainId),
        address,
        signer: {
          type: 'key',
          data: {
            type: 'secp256k1',
            publicKey: signer.publicKey
          }
        },
        permissions: purchaseDonutPermissions['permissions'],
        policies: purchaseDonutPermissions['policies'] || []
      }
      const response = await grantPermissions(grantPurchaseDonutPermissions)
      setSmartSessionResponse({
        chainId: parseInt(chainId.toString(), 10),
        response
      })
      toast({
        type: 'success',
        title: 'Permissions Granted',
        description: JSON.stringify(response, bigIntReplacer)
      })
    } catch (error) {
      toast({
        type: 'error',
        title: 'Request Permissions Errors',
        description: error instanceof Error ? error.message : 'Unknown Error'
      })
    } finally {
      setRequestPermissionLoading(false)
    }
  }, [signer, provider, address, chainId, grantPermissions, toast])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="request-permissions-button"
        onClick={onRequestPermissions}
        isDisabled={Boolean(isRequestPermissionLoading || Boolean(smartSessionResponse))}
        isLoading={isRequestPermissionLoading}
      >
        Request Permissions
      </Button>
      <Button
        data-test-id="clear-permissions-button"
        onClick={clearSmartSessionResponse}
        isDisabled={!smartSessionResponse}
      >
        Clear Permissions
      </Button>
    </Stack>
  )
}
