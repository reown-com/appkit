import { Button, Stack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { walletActionsErc7715 } from 'viem/experimental'
import { useCallback, useState } from 'react'
import { useChakraToast } from '../Toast'
import { createPublicClient, custom } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'
import { useWalletConnectCosigner } from '../../hooks/useWalletConnectCosigner'
import { useWagmiAvailableCapabilities } from '../../hooks/useWagmiActiveCapabilities'
import { useWagmiPermissionsAsync } from '../../context/WagmiPermissionsAsyncContext'
import {
  decodeUncompressedPublicKey,
  encodePublicKeyToDID,
  hexStringToBase64
} from '../../utils/EncodingUtils'
import { bigIntReplacer } from '../../utils/CommonUtils'
import { getSampleAsyncPermissions } from '../../utils/ERC7715Utils'

export function WagmiRequestPermissionsAsyncTest() {
  const { provider, supported } = useWagmiAvailableCapabilities({
    method: EIP_7715_RPC_METHODS.WALLET_GRANT_PERMISSIONS
  })
  const { chain, address, isConnected } = useAccount()
  const caip10Address = `eip155:${chain?.id}:${address}`

  const {
    projectId,
    signer,
    grantedPermissions,
    clearGrantedPermissions,
    setGrantedPermissions,
    setWCCosignerData
  } = useWagmiPermissionsAsync()
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const { addPermission, updatePermissionsContext } = useWalletConnectCosigner(
    caip10Address,
    projectId
  )
  const toast = useChakraToast()

  const onRequestPermissions = useCallback(async () => {
    setRequestPermissionLoading(true)

    if (!signer) {
      throw new Error('PrivateKey signer not available')
    }
    if (!provider) {
      throw new Error('No Provider available, Please connect your wallet.')
    }
    try {
      const addPermissionResponse = await addPermission({
        permissionType: 'donut-purchase',
        data: '',
        onChainValidated: false,
        required: true
      })
      setWCCosignerData(addPermissionResponse)
      const cosignerPublicKey = decodeUncompressedPublicKey(addPermissionResponse.key)

      const dAppECDSAPublicKey = signer.publicKey
      const dAppSecp256k1DID = encodePublicKeyToDID(dAppECDSAPublicKey, 'secp256k1')
      const coSignerSecp256k1DID = encodePublicKeyToDID(cosignerPublicKey, 'secp256k1')

      const publicClient = createPublicClient({
        chain,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        transport: custom(provider)
      }).extend(walletActionsErc7715())
      const samplePermissions = getSampleAsyncPermissions([coSignerSecp256k1DID, dAppSecp256k1DID])
      const approvedPermissions = await publicClient.grantPermissions(samplePermissions)
      if (approvedPermissions) {
        await updatePermissionsContext({
          pci: addPermissionResponse.pci,
          context: {
            expiry: approvedPermissions.expiry,
            signer: {
              type: 'donut-purchase',
              data: {
                ids: [addPermissionResponse.key, hexStringToBase64(dAppECDSAPublicKey)]
              }
            },
            signerData: {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
              userOpBuilder: approvedPermissions.signerData?.userOpBuilder!
            },
            permissionsContext: approvedPermissions.permissionsContext,
            factory: approvedPermissions.factory || '',
            factoryData: approvedPermissions.factoryData || ''
          }
        })
        setGrantedPermissions(approvedPermissions)
        setRequestPermissionLoading(false)
        toast({
          type: 'success',
          title: 'Permissions Granted',
          description: JSON.stringify(approvedPermissions, bigIntReplacer)
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
  }, [signer, provider])
  if (!isConnected || !provider || !address) {
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
        onClick={clearGrantedPermissions}
        isDisabled={!grantedPermissions}
      >
        Clear Permissions
      </Button>
    </Stack>
  )
}
