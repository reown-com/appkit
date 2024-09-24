import { Button, Stack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { useCallback, useState } from 'react'
import { useChakraToast } from '../Toast'
import { toHex, type Address, type Chain } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'
import {
  useWagmiAvailableCapabilities,
  type Provider
} from '../../hooks/useWagmiActiveCapabilities'
import { useLocalEcdsaKey } from '../../context/LocalEcdsaKeyContext'
import { bigIntReplacer } from '../../utils/CommonUtils'
import { useERC7715Permissions } from '../../hooks/useERC7715Permissions'
import { getPurchaseDonutPermissions } from '../../utils/ERC7715Utils'
import { useAppKitAccount } from '@reown/appkit/react'
import {
  useSmartSession,
  type SmartSessionGrantPermissionsRequest
} from '@reown/appkit-experimental-smart-session'

export function WagmiRequestPermissionsAsyncTest() {
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
  address: Address
}) {
  const { grantPermissions } = useSmartSession()
  const { grantedPermissions, clearGrantedPermissions } = useERC7715Permissions()
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
        chainId: toHex(chain.id),
        address,
        signer: {
          type: 'key',
          data: {
            type: 'secp256k1',
            publicKey: signer.publicKey
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
  }, [signer, provider, address, chain, grantPermissions, toast])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="request-permissions-button"
        onClick={onRequestPermissions}
        isDisabled={Boolean(isRequestPermissionLoading || Boolean(grantedPermissions))}
        isLoading={isRequestPermissionLoading}
      >
        Request Permissions
      </Button>
      <Button
        data-test-id="clear-permissions-button"
        onClick={clearGrantedPermissions}
        isDisabled={!grantedPermissions}
      >
        Clear Permissions
      </Button>
    </Stack>
  )
}
