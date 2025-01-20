import { useState } from 'react'

import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import { encodeFunctionData, parseEther } from 'viem'
import { useReadContract } from 'wagmi'

import type { SmartSessionGrantPermissionsResponse } from '@reown/appkit-experimental/smart-session'

import { useLocalEcdsaKey } from '../../context/LocalEcdsaKeyContext'
import { useERC7715Permissions } from '../../hooks/useERC7715Permissions'
import { abi as donutContractAbi, address as donutContractaddress } from '../../utils/DonutContract'
import { executeActionsWithECDSAKey } from '../../utils/ERC7715Utils'
import { getChain } from '../../utils/NetworksUtil'
import { useChakraToast } from '../Toast'

export function WagmiPurchaseDonutAsyncPermissionsTest() {
  const { smartSession } = useERC7715Permissions()

  if (smartSession?.type !== 'async' || !smartSession.grantedPermissions?.context) {
    return (
      <Text fontSize="md" color="yellow">
        Dapp does not have the permissions
      </Text>
    )
  }

  return <ConnectedTestContent grantedPermissions={smartSession.grantedPermissions} />
}

function ConnectedTestContent({
  grantedPermissions
}: {
  grantedPermissions: SmartSessionGrantPermissionsResponse
}) {
  const { privateKey } = useLocalEcdsaKey()
  const toast = useChakraToast()
  const [isTransactionPending, setTransactionPending] = useState<boolean>(false)

  const {
    data: donutsOwned,
    refetch: fetchDonutsOwned,
    isLoading: donutsQueryLoading,
    isRefetching: donutsQueryRefetching
  } = useReadContract({
    abi: donutContractAbi,
    address: donutContractaddress,
    functionName: 'getBalance',
    args: [grantedPermissions.address]
  })

  async function onPurchaseDonutWithPermissions() {
    setTransactionPending(true)
    try {
      const chainId = parseInt(grantedPermissions.chainId, 16)
      if (!chainId) {
        throw new Error('Chain ID not available in granted permissions')
      }
      const chain = getChain(chainId)
      if (!chain) {
        throw new Error('Unknown chainId')
      }
      if (!privateKey) {
        throw new Error(`Unable to get dApp private key`)
      }

      const purchaseDonutCallData = encodeFunctionData({
        abi: donutContractAbi,
        functionName: 'purchase',
        args: [1]
      })
      const purchaseDonutCallDataExecution = [
        {
          to: donutContractaddress as `0x${string}`,
          value: parseEther('0.00001'),
          data: purchaseDonutCallData
        }
      ]
      const txHash = await executeActionsWithECDSAKey({
        actions: purchaseDonutCallDataExecution,
        chain,
        ecdsaPrivateKey: privateKey as `0x${string}`,
        accountAddress: grantedPermissions.address,
        permissionsContext: grantedPermissions.context
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

  return (
    <Stack direction={['column']}>
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
            <Text marginRight="5px">Crypto donuts purchased:</Text>
            <Text>{donutsOwned?.toString()}</Text>
          </>
        )}
      </Flex>
    </Stack>
  )
}
