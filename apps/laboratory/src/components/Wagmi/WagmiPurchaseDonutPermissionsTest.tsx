import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import { useAccount, useReadContract } from 'wagmi'
import { useState } from 'react'
import { useChakraToast } from '../Toast'
import { encodeFunctionData, parseEther } from 'viem'
import { abi as donutContractAbi, address as donutContractaddress } from '../../utils/DonutContract'
import { usePermissions } from '../../hooks/usePermissions'
import { useGrantedPermissions } from '../../hooks/useGrantedPermissions'

export function WagmiPurchaseDonutWithPermissionsTest() {
  const { address, chain } = useAccount()
  const { buildAndSendTransactionsWithPermissions } = usePermissions(chain)
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
