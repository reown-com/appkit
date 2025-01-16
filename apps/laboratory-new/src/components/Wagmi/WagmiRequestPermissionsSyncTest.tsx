import { useCallback, useMemo, useState } from 'react'

import { Button, Stack, Text } from '@chakra-ui/react'
import { type Address, toHex } from 'viem'
import { type P256Credential, serializePublicKey } from 'webauthn-p256'

import {
  type SmartSessionGrantPermissionsRequest,
  grantPermissions,
  isSmartSessionSupported
} from '@reown/appkit-experimental/smart-session'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit-new/react'

import { usePasskey } from '../../context/PasskeyContext'
import { useERC7715Permissions } from '../../hooks/useERC7715Permissions'
import { bigIntReplacer } from '../../utils/CommonUtils'
import { getPurchaseDonutPermissions } from '../../utils/ERC7715Utils'
import { useChakraToast } from '../Toast'

export function WagmiRequestPermissionsSyncTest() {
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
  address: Address | undefined
}) {
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const { passkey } = usePasskey()
  const { clearSmartSession, setSmartSession, smartSession } = useERC7715Permissions()
  const toast = useChakraToast()

  const onRequestPermissions = useCallback(async () => {
    setRequestPermissionLoading(true)
    try {
      if (!address) {
        throw new Error('No account address available, Please connect your wallet.')
      }
      if (!passkey) {
        throw new Error('Passkey not available')
      }
      let p256Credential = passkey as P256Credential
      p256Credential = {
        ...p256Credential,
        publicKey: {
          prefix: p256Credential.publicKey.prefix,
          x: BigInt(p256Credential.publicKey.x),
          y: BigInt(p256Credential.publicKey.y)
        }
      }
      const passkeyPublicKey = serializePublicKey(p256Credential.publicKey, { to: 'hex' })
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
                type: 'secp256r1',
                publicKey: passkeyPublicKey
              }
            ]
          }
        },
        ...purchaseDonutPermissions
      }
      const response = await grantPermissions(grantPurchaseDonutPermissions)
      setSmartSession({
        type: 'sync',
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
  }, [passkey, address, chainId, grantPermissions, toast])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-testid="request-permissions-button"
        onClick={onRequestPermissions}
        isDisabled={Boolean(isRequestPermissionLoading || Boolean(smartSession?.type === 'sync'))}
        isLoading={isRequestPermissionLoading}
      >
        Request Permissions
      </Button>
      <Button
        data-test-id="clear-smart-session-button"
        onClick={clearSmartSession}
        isDisabled={!smartSession || smartSession.type !== 'sync'}
      >
        Clear Permissions
      </Button>
    </Stack>
  )
}
