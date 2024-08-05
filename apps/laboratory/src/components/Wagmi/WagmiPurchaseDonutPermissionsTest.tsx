import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import { useReadContract } from 'wagmi'
import { useState } from 'react'
import { useChakraToast } from '../Toast'
import { encodeFunctionData, parseEther } from 'viem'
import { abi as donutContractAbi, address as donutContractaddress } from '../../utils/DonutContract'
import { useERC7715PermissionsSync } from '../../hooks/useERC7715PermissionsSync'
import { useWagmiPermissions } from '../../context/WagmiPermissionsContext'
import { sepolia } from 'viem/chains'

export function WagmiPurchaseDonutWithPermissionsTest() {
  const { executeActionsWithPasskeyAndCosignerPermissions } = useERC7715PermissionsSync()

  const { grantedPermissions, wcCosignerData } = useWagmiPermissions()
  const {
    data: donutsOwned,
    refetch: fetchDonutsOwned,
    isLoading: donutsQueryLoading,
    isRefetching: donutsQueryRefetching
  } = useReadContract({
    abi: donutContractAbi,
    address: donutContractaddress,
    functionName: 'getBalance',
    args: [grantedPermissions?.signerData?.submitToAddress || '0x']
  })

  const [isTransactionPending, setTransactionPending] = useState<boolean>(false)
  const toast = useChakraToast()

  async function onPurchaseDonutWithPermissions() {
    setTransactionPending(true)
    try {
      if (!grantedPermissions) {
        throw Error('No permissions available')
      }
      if (!wcCosignerData) {
        throw Error('No wc-cosigner data available')
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
      const txHash = await executeActionsWithPasskeyAndCosignerPermissions({
        actions: purchaseDonutCallDataExecution,
        permissions: grantedPermissions,
        chain: sepolia
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
      // Console.log(error)
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
