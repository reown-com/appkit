import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import { useAccount, useReadContract } from 'wagmi'
import { useState } from 'react'
import { useChakraToast } from '../Toast'
import { encodeFunctionData, parseEther } from 'viem'
import { abi as donutContractAbi, address as donutContractaddress } from '../../utils/DonutContract'
import { useERC7715Permissions } from '../../hooks/useERC7715Permissions'
import { usePasskey } from '../../context/PasskeyContext'
import { executeActionsWithPasskeyAndCosignerPermissions } from '../../utils/ERC7715Utils'
import { getChain } from '../../utils/NetworksUtil'

export function WagmiPurchaseDonutSyncPermissionsTest() {
  const { passkeyId } = usePasskey()
  const { smartSessionResponse } = useERC7715Permissions()
  const { address } = useAccount()
  const {
    data: donutsOwned,
    refetch: fetchDonutsOwned,
    isLoading: donutsQueryLoading,
    isRefetching: donutsQueryRefetching
  } = useReadContract({
    abi: donutContractAbi,
    address: donutContractaddress,
    functionName: 'getBalance',
    args: [address || '0x']
  })

  const [isTransactionPending, setTransactionPending] = useState<boolean>(false)
  const toast = useChakraToast()

  async function onPurchaseDonutWithPermissions() {
    setTransactionPending(true)
    try {
      const chainId = smartSessionResponse?.chainId
      if (!chainId) {
        throw new Error('Chain ID not available for granted permissions')
      }
      const chain = getChain(chainId)
      if (!chain) {
        throw new Error('Invalid chain')
      }
      if (!smartSessionResponse?.response?.context) {
        throw Error('No permissions context available')
      }

      const purchaseDonutCallData = encodeFunctionData({
        abi: donutContractAbi,
        functionName: 'purchase',
        args: [1]
      })
      const purchaseDonutCallDataExecution = [
        {
          to: donutContractaddress as `0x${string}`,
          value: parseEther('0.0001'),
          data: purchaseDonutCallData
        }
      ]
      const txHash = await executeActionsWithPasskeyAndCosignerPermissions({
        actions: purchaseDonutCallDataExecution,
        chain,
        passkeyId,
        accountAddress: address as `0x${string}`,
        permissionsContext: smartSessionResponse.response.context
      })
      if (txHash) {
        toast({
          title: 'UserOp submitted successfully',
          description: `UserOp Hash: ${txHash}`,
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

  if (!smartSessionResponse) {
    return (
      <Text fontSize="md" color="yellow">
        Dapp does not have the permissions
      </Text>
    )
  }

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        isDisabled={!smartSessionResponse}
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
