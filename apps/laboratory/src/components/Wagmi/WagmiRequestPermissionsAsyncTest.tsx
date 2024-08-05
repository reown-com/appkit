import { Button, Stack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { walletActionsErc7715, type GrantPermissionsParameters } from 'viem/experimental'
import { useCallback, useState } from 'react'
import { useChakraToast } from '../Toast'
import { createPublicClient, custom, parseEther } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'
import {
  bigIntReplacer,
  decodeUncompressedPublicKey,
  encodePublicKeyToDID,
  hexStringToBase64
} from '../../utils/CommonUtils'
import { abi as donutContractAbi, address as donutContractAddress } from '../../utils/DonutContract'
import { useWalletConnectCosigner } from '../../hooks/useWalletConnectCosigner'
import { useWagmiAvailableCapabilities } from '../../hooks/useWagmiActiveCapabilities'
import { useWagmiPermissionsAsync } from '../../context/WagmiPermissionsAsyncContext'

export function WagmiRequestPermissionsAsyncTest() {
  const { ethereumProvider, isMethodSupported } = useWagmiAvailableCapabilities({
    method: EIP_7715_RPC_METHODS.WALLET_GRANT_PERMISSIONS
  })
  const { chain, address, isConnected } = useAccount()
  const {
    signer,
    grantedPermissions,
    clearGrantedPermissions,
    setGrantedPermissions,
    setWCCosignerData
  } = useWagmiPermissionsAsync()
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const { addPermission, updatePermissionsContext } = useWalletConnectCosigner()
  const toast = useChakraToast()

  function getSamplePermissions(keys: string[]): GrantPermissionsParameters {
    return {
      expiry: Date.now() + 24 * 60 * 60,
      permissions: [
        {
          type: {
            custom: 'donut-purchase'
          },
          data: {
            target: donutContractAddress,
            abi: donutContractAbi,
            valueLimit: parseEther('10'),
            functionName: 'function purchase()'
          },
          policies: []
        }
      ],
      signer: {
        type: 'keys',
        data: {
          ids: keys
        }
      }
    }
  }

  const onRequestPermissions = useCallback(async () => {
    setRequestPermissionLoading(true)
    const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
    }
    if (!signer) {
      throw new Error('PrivateKey signer not available')
    }
    const caip10Address = `eip155:${chain?.id}:${address}`
    try {
      const addPermissionResponse = await addPermission(caip10Address, projectId, {
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
        transport: custom(ethereumProvider!)
      }).extend(walletActionsErc7715())
      const samplePermissions = getSamplePermissions([coSignerSecp256k1DID, dAppSecp256k1DID])
      const approvedPermissions = await publicClient.grantPermissions(samplePermissions)
      if (approvedPermissions) {
        await updatePermissionsContext(caip10Address, projectId, {
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
  }, [signer, ethereumProvider])
  if (!isConnected || !ethereumProvider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (!isMethodSupported()) {
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
