import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import { useAccount, useReadContract } from 'wagmi'
import { useState } from 'react'
import { useChakraToast } from '../Toast'
import { encodeFunctionData, parseEther } from 'viem'
import { abi as donutContractAbi, address as donutContractaddress } from '../../utils/DonutContract'
import { usePermissions } from '../../hooks/usePermissions'
import { useGrantedPermissions } from '../../hooks/useGrantedPermissions'
import { useLocalSigner } from '../../hooks/useLocalSigner'

export function WagmiPurchaseDonutWithPermissionsTest() {
  const { address, chain } = useAccount()
  const { buildAndSendTransactionsECDSAKeyAndPermissions } = usePermissions()
  const { signerPrivateKey: ecdsaPrivateKey } = useLocalSigner()

  const { grantedPermissions } = useGrantedPermissions()
  const {
    data: donutsOwned,
    refetch: fetchDonutsOwned,
    isLoading: donutsQueryLoading,
    isRefetching: donutsQueryRefetching
  } = useReadContract({
    abi: donutContractAbi,
    address: donutContractaddress,
    functionName: 'getBalance',
    args: [grantedPermissions?.signerData?.submitToAddress || address]
  })

  const [isTransactionPending, setTransactionPending] = useState<boolean>(false)
  const toast = useChakraToast()

  async function onPurchaseDonutWithPermissions() {
    setTransactionPending(true)
    try {
      if (!grantedPermissions) {
        throw Error('No permissions available')
      }
      if (!chain) {
        throw new Error(`chain ${chain}`)
      }
      if (!ecdsaPrivateKey) {
        throw new Error(`Invalid ecdsaPrivateKey:${ecdsaPrivateKey}`)
      }
      const purchaseDonutCallData = encodeFunctionData({
        abi: donutContractAbi,
        functionName: 'purchase',
        args: [1]
      })
      const purchaseDonutCallDataExecution = [
        {
          target: donutContractaddress as `0x${string}`,
          value: parseEther('0.0001'),
          callData: purchaseDonutCallData
        }
      ]
      const txHash = await buildAndSendTransactionsECDSAKeyAndPermissions({
        actions: purchaseDonutCallDataExecution,
        ecdsaPrivateKey: ecdsaPrivateKey as `0x${string}`,
        permissions: grantedPermissions,
        chain
      })
      if (txHash) {
        toast({
          title: 'Transaction success',
          description: txHash,
          type: 'success'
        })
        await fetchDonutsOwned()
      }
    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description: `${error}`,
        type: 'error'
      })
    }
    setTransactionPending(false)
  }

  if (!grantedPermissions) {
    return (
      <Text fontSize="md" color="yellow">
        Dapp does not have the permissions
      </Text>
    )
  }

  return (
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
  )
}
