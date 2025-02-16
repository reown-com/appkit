import { useCallback, useState } from 'react'

import { Button, Stack, Text } from '@chakra-ui/react'
import { type Address, toHex } from 'viem'

import {
  type SmartSessionGrantPermissionsRequest,
  createSubscription,
  grantPermissions,
  isSmartSessionSupported
} from '@reown/appkit-experimental/smart-session'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

import { useLocalEcdsaKey } from '../../context/LocalEcdsaKeyContext'
import { useERC7715Permissions } from '../../hooks/useERC7715Permissions'
import { bigIntReplacer } from '../../utils/CommonUtils'
import { getPurchaseDonutPermissions } from '../../utils/ERC7715Utils'
import { useChakraToast } from '../Toast'

export function WagmiRequestPermissionsAsyncTest() {
  const { address, isConnected } = useAppKitAccount()

  const { chainId } = useAppKitNetwork()
  const isSupported = isSmartSessionSupported()

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
  const onCreateSubscription = useCallback(async () => {
    setRequestPermissionLoading(true)
    try {
      if (!signer) {
        throw new Error('No signer available')
      }
      const response = await createSubscription({
        chainId: toHex(chainId),
        signerPublicKey: signer.publicKey,
        interval: '1s',
        asset: 'native',
        amount: '0x16345785D8A0000',
        expiry: Math.floor(Date.now() / 1000) + 24 * 60 * 60
      })
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
        data-test-id="request-permissions-button"
        onClick={onCreateSubscription}
        isDisabled={Boolean(isRequestPermissionLoading || Boolean(smartSession?.type === 'async'))}
        isLoading={isRequestPermissionLoading}
      >
        Create Subscription
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
