import { Button, Stack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { walletActionsErc7715 } from 'viem/experimental'
import { useCallback, useState } from 'react'
import { useChakraToast } from '../Toast'
import { createWalletClient, custom, type Address, type Chain } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'
import {
  useWagmiAvailableCapabilities,
  type Provider
} from '../../hooks/useWagmiActiveCapabilities'
import { useLocalEcdsaKey } from '../../context/LocalEcdsaKeyContext'
import { bigIntReplacer } from '../../utils/CommonUtils'
import { useERC7715Permissions } from '../../hooks/useERC7715Permissions'
import { getPurchaseDonutPermissions } from '../../utils/ERC7715Utils'
import { KeyTypes } from '../../utils/EncodingUtils'

export function WagmiRequestPermissionsAsyncTest() {
  const { provider, supported } = useWagmiAvailableCapabilities({
    method: EIP_7715_RPC_METHODS.WALLET_GRANT_PERMISSIONS
  })
  const { chain, address, isConnected } = useAccount()

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

  return <ConnectedTestContent chain={chain} provider={provider} address={address} />
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
  const { grantedPermissions, clearGrantedPermissions, requestPermissions } =
    useERC7715Permissions()
  const { signer } = useLocalEcdsaKey()
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const toast = useChakraToast()

  const onRequestPermissions = useCallback(async () => {
    setRequestPermissionLoading(true)
    try {
      if (!signer) {
        throw new Error('PrivateKey signer not available')
      }
      if (!provider) {
        throw new Error('No Provider available, Please connect your wallet.')
      }

      const walletClient = createWalletClient({
        account: address,
        chain,
        transport: custom(provider)
      }).extend(walletActionsErc7715())

      const purchaseDonutPermissions = getPurchaseDonutPermissions()
      const response = await requestPermissions(walletClient, {
        permissions: purchaseDonutPermissions,
        signerKey: {
          key: signer.publicKey,
          type: KeyTypes.secp256k1
        }
      })
      toast({
        type: 'success',
        title: 'Permissions Granted',
        description: JSON.stringify(response.approvedPermissions, bigIntReplacer)
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
  }, [signer, provider])

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
