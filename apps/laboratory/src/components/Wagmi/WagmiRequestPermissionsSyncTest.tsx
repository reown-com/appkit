import { Button, Stack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { useCallback, useState } from 'react'
import { useChakraToast } from '../Toast'
import { toHex, type Address, type Chain } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'
import { usePasskey } from '../../context/PasskeyContext'
import {
  useWagmiAvailableCapabilities,
  type Provider
} from '../../hooks/useWagmiActiveCapabilities'
import { useERC7715Permissions } from '../../hooks/useERC7715Permissions'
import { bigIntReplacer } from '../../utils/CommonUtils'
import { getPurchaseDonutPermissions } from '../../utils/ERC7715Utils'
import { serializePublicKey, type P256Credential } from 'webauthn-p256'
import { useAppKitAccount } from '@reown/appkit/react'
import {
  grantPermissions,
  type SmartSessionGrantPermissionsRequest
} from '@reown/appkit-experimental/smart-session'

export function WagmiRequestPermissionsSyncTest() {
  const { provider, supported } = useWagmiAvailableCapabilities({
    method: EIP_7715_RPC_METHODS.WALLET_GRANT_PERMISSIONS
  })
  const { address, isConnected } = useAppKitAccount()
  const { chain } = useAccount()

  if (!isConnected || !provider || !address || !chain) {
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

  return <ConnectedTestContent chain={chain} provider={provider} address={address as Address} />
}

function ConnectedTestContent({
  chain,
  provider,
  address
}: {
  chain: Chain
  provider: Provider
  address: Address | undefined
}) {
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const { passkey } = usePasskey()
  const { smartSessionResponse, clearSmartSessionResponse } = useERC7715Permissions()
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
        chainId: toHex(chain.id),
        address,
        signer: {
          type: 'key',
          data: {
            type: 'secp256r1',
            publicKey: passkeyPublicKey
          }
        },
        ...purchaseDonutPermissions
      }
      const response = await grantPermissions(grantPurchaseDonutPermissions)

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
  }, [passkey, provider, address, chain, grantPermissions, toast])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-testid="request-permissions-button"
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
