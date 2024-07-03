import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, useReadContract, type Connector } from 'wagmi'
import { type Chain } from 'wagmi/chains'
import { type GrantPermissionsReturnType } from 'viem/experimental'
import {
  ENTRYPOINT_ADDRESS_V07,
  createBundlerClient,
  getPackedUserOperation,
  getUserOperationHash
} from 'permissionless'
import { pimlicoBundlerActions } from 'permissionless/actions/pimlico'
import { type UserOperation } from 'permissionless/types'
import { useState, useEffect } from 'react'
import { useChakraToast } from '../Toast'
import { createPublicClient, encodeFunctionData, http, parseEther, signatureToHex } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'
import { GRANTED_PERMISSIONS_KEY } from '../../utils/LocalStorage'
import { useLocalSigner } from '../../hooks/useLocalSigner'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import { sepolia } from 'viem/chains'
import { abi as donutContractAbi, address as donutContractaddress } from '../../utils/DonutContract'
import { sign } from 'viem/accounts'
import { useUserOpBuilder, type Execution } from '../../hooks/useUserOpBuilder'

export function WagmiPurchaseDonutWithPermissionsTest() {
  const { status, chain, address, connector } = useAccount()
  const { getCallDataWithContext, getNonceWithContext, getSignatureWithContext } =
    useUserOpBuilder()
  const { signer, signerPrivateKey } = useLocalSigner()
  const {
    data: donutsOwned,
    refetch: fetchDonutsOwned,
    isLoading: donutsQueryLoading,
    isRefetching: donutsQueryRefetching
  } = useReadContract({
    abi: donutContractAbi,
    address: donutContractaddress,
    functionName: 'getBalance',
    args: [address]
  })

  const [isTransactionPending, setTransactionPending] = useState<boolean>(false)
  const [grantedPermissions] = useLocalStorageState<GrantPermissionsReturnType | undefined>(
    GRANTED_PERMISSIONS_KEY,
    undefined
  )

  const [ethereumProvider, setEthereumProvider] =
    useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()

  const toast = useChakraToast()

  const isConnected = status === 'connected'

  useEffect(() => {
    if (isConnected && connector && address && chain) {
      fetchProviderAndAccountCapabilities(connector, chain)
    }
  }, [isConnected, connector, address])

  async function onPurchaseDonutWithPermissions() {
    setTransactionPending(true)
    try {
      if (!grantedPermissions) {
        throw Error('No permissions available')
      }
      const callData = encodeFunctionData({
        abi: donutContractAbi,
        functionName: 'purchase',
        args: [1]
      })

      const txHash = await buildAndSendTransactionsWithPermissions(grantedPermissions, [
        {
          target: donutContractaddress,
          value: parseEther('0.0001'),
          callData
        }
      ])
      if (txHash) {
        toast({
          title: 'Success',
          description: 'Signing with local key successfully completed',
          type: 'success'
        })
        await fetchDonutsOwned()
      }
    } catch (error) {
      toast({
        title: 'Failure',
        description: 'Error while trying to sign with local private key',
        type: 'error'
      })
    }
    setTransactionPending(false)
  }

  async function buildAndSendTransactionsWithPermissions(
    grantedPermissionsResponse: GrantPermissionsReturnType,
    actions: Execution[]
  ): Promise<`0x${string}`> {
    if (!signerPrivateKey || !signer) {
      throw new Error('No dapp signer key available.')
    }
    const apiKey = process.env['NEXT_PUBLIC_PIMLICO_KEY']
    const bundlerUrl = `https://api.pimlico.io/v1/sepolia/rpc?apikey=${apiKey}`

    const entryPoint = ENTRYPOINT_ADDRESS_V07
    const publicClient = createPublicClient({
      transport: http(),
      chain: sepolia
    })

    const bundlerClient = createBundlerClient({
      transport: http(bundlerUrl),
      entryPoint,
      chain: sepolia
    }).extend(pimlicoBundlerActions(entryPoint))

    const { factory, factoryData, signerData, permissionsContext } = grantedPermissionsResponse
    if (!signerData?.userOpBuilder || !signerData.submitToAddress || !permissionsContext) {
      throw new Error('Missing value in granted permissions response')
    }
    const testDappPrivateKey = signerPrivateKey as `0x${string}`

    const nonce = await getNonceWithContext(publicClient, {
      userOpBuilderAddress: signerData.userOpBuilder,
      sender: signerData.submitToAddress,
      permissionsContext: permissionsContext as `0x${string}`
    })

    const callData = await getCallDataWithContext(publicClient, {
      userOpBuilderAddress: signerData.userOpBuilder,
      sender: signerData.submitToAddress,
      permissionsContext: permissionsContext as `0x${string}`,
      actions
    })

    const gasPrice = await bundlerClient.getUserOperationGasPrice()
    const userOp: UserOperation<'v0.7'> = {
      sender: signerData.submitToAddress,
      factory,
      factoryData: factoryData ? (factoryData as `0x${string}`) : undefined,
      nonce,
      callData,
      callGasLimit: BigInt(2000000),
      verificationGasLimit: BigInt(2000000),
      preVerificationGas: BigInt(2000000),
      maxFeePerGas: gasPrice.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
      signature: '0x'
    }
    const userOpHash = getUserOperationHash({
      userOperation: {
        ...userOp
      },
      entryPoint,
      chainId: sepolia.id
    })

    const dappSignatureOnUserOp = await sign({
      privateKey: testDappPrivateKey,
      hash: userOpHash
    })
    const rawSignature = signatureToHex(dappSignatureOnUserOp)
    userOp.signature = rawSignature
    const preSignaturePackedUserOp = getPackedUserOperation(userOp)
    const finalSigForValidator = await getSignatureWithContext(publicClient, {
      sender: signerData.submitToAddress,
      permissionsContext: permissionsContext as `0x${string}`,
      userOperation: preSignaturePackedUserOp,
      userOpBuilderAddress: signerData.userOpBuilder
    })

    userOp.signature = finalSigForValidator

    const _userOpHash = await bundlerClient.sendUserOperation({
      userOperation: userOp
    })

    const txReceipt = await bundlerClient.waitForUserOperationReceipt({
      hash: _userOpHash,
      timeout: 120000
    })

    return txReceipt.receipt.transactionHash
  }

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
      setEthereumProvider(connectedProvider)
    }
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
  const allowedChains = [sepolia.id] as number[]

  return allowedChains.includes(Number(chain?.id)) && status === 'connected' ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        isDisabled={!grantedPermissions}
        isLoading={isTransactionPending}
        onClick={onPurchaseDonutWithPermissions}
      >
        Purchase Donut
      </Button>
      <Flex alignItems="center">
        {donutsQueryLoading || donutsQueryRefetching ? (
          <Text>Fetching donuts...</Text>
        ) : (
          <>
            <Text marginRight="5px">Crypto donuts left:</Text>
            <Text>{donutsOwned?.toString()}</Text>
          </>
        )}
      </Flex>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Sepolia to test this feature
    </Text>
  )
}
