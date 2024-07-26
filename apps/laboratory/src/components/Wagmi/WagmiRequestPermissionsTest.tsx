/* eslint-disable no-console */
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
import {
  bigIntReplacer,
  decodeUncompressedPublicKey,
  encodePublicKeyToDID,
  hexStringToBase64
} from '../../utils/CommonUtils'
import { useGrantedPermissions } from '../../hooks/useGrantedPermissions'
import usePasskey from '../../hooks/usePasskey'
import { serializePublicKey, type P256Credential } from 'webauthn-p256'
import { CoSignerApiError, useWalletConnectCosigner } from '../../hooks/useWalletConnectCosigner'

export function WagmiRequestPermissionsTest() {
  const { status, chain, address, connector } = useAccount()
  const { passKey } = usePasskey()
  const { signer } = useLocalSigner()

  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const { grantedPermissions, setGrantedPermissions, setWCCosignerData } = useGrantedPermissions()
  const { addPermission, updatePermissionsContext } = useWalletConnectCosigner()
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
    const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
    }
    if (!passKey) {
      throw new Error('Passkey not available')
    }
    const caip10Address = `eip155:${chain?.id}:${address}`
    try {
      const addPermissionResponse = await addPermission(caip10Address, projectId, {
        permissionType: 'native-token-transfer',
        data: '',
        onChainValidated: false,
        required: true
      })
      console.info({ addPermissionResponse })
      setWCCosignerData(addPermissionResponse)
      const cosignerPublicKey = decodeUncompressedPublicKey(addPermissionResponse.key)
      let p = passKey as P256Credential
      p = {
        ...p,
        publicKey: {
          prefix: p.publicKey.prefix,
          x: BigInt(p.publicKey.x),
          y: BigInt(p.publicKey.y)
        }
      }
      const passkeyPublicKey = serializePublicKey(p.publicKey, { to: 'hex' })
      const passkeyDID = encodePublicKeyToDID(passkeyPublicKey, 'secp256r1')
      const secp256k1DID = encodePublicKeyToDID(cosignerPublicKey, 'secp256k1')

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
          type: 'keys',
          data: {
            ids: [secp256k1DID, passkeyDID]
          }
        }
      })
      if (permissions) {
        await updatePermissionsContext(caip10Address, projectId, {
          pci: addPermissionResponse.pci,
          context: {
            expiry: permissions.expiry,
            signer: {
              type: 'native-token-transfer',
              data: {
                ids: [addPermissionResponse.key, hexStringToBase64(passkeyPublicKey)]
              }
            },
            signerData: {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
              userOpBuilder: permissions.signerData?.userOpBuilder!
            },
            permissionsContext: permissions.permissionsContext,
            factory: permissions.factory || '',
            factoryData: permissions.factoryData || ''
          }
        })
        console.info('Updated the context on co-signer')
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
      if (error instanceof CoSignerApiError) {
        console.error(`API Error ${error.status}: ${error.message}`)
      }
      console.error('Unexpected error:', error)
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
