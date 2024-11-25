import { Button, Stack, Text } from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { useChakraToast } from '../Toast'
import { toHex, type Address } from 'viem'
import { useLocalEcdsaKey } from '../../context/LocalEcdsaKeyContext'
import { bigIntReplacer } from '../../utils/CommonUtils'
import { useERC7715Permissions } from '../../hooks/useERC7715Permissions'
import { getPurchaseDonutPermissions } from '../../utils/ERC7715Utils'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit-new/react'
import {
  grantPermissions,
  isSmartSessionSupported,
  type SmartSessionGrantPermissionsRequest
} from '@reown/appkit-experimental/smart-session'

export function WagmiRequestPermissionsAsyncTest() {
  const { address, isConnected, status } = useAppKitAccount()

  const { chainId } = useAppKitNetwork()
  const isSupported = useMemo(() => isSmartSessionSupported(), [status])

  if (!isConnected || !address || !chainId) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }

  if (!isSupported) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support wallet_grantPermissions rpc method
      </Text>
    )
  }

  return <ConnectedTestContent chainId={chainId} address={address as Address} />
}

function ConnectedTestContent({
  chainId,
  address
}: {
  chainId: string | number
  address: Address
}) {
  const { clearSmartSession, setSmartSession, smartSession } = useERC7715Permissions()
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
          type: 'keys',
          data: {
            keys: [
              {
                type: 'secp256k1',
                publicKey: signer.publicKey
              }
            ]
          }
        },
        permissions: purchaseDonutPermissions['permissions'],
        policies: purchaseDonutPermissions['policies'] || []
      }
      const response = await grantPermissions(grantPurchaseDonutPermissions)
      setSmartSession({
        type: 'async',
        grantedPermissions: response
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
  }, [signer, address, chainId, grantPermissions, toast])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="request-permissions-button"
        onClick={onRequestPermissions}
        isDisabled={Boolean(isRequestPermissionLoading || Boolean(smartSession?.type === 'async'))}
        isLoading={isRequestPermissionLoading}
      >
        Request Permissions
      </Button>
      <Button
        data-test-id="clear-permissions-button"
        onClick={clearSmartSession}
        isDisabled={!smartSession || smartSession.type !== 'async'}
      >
        Clear Permissions
      </Button>
    </Stack>
  )
}
