import { useCallback, useEffect } from 'react'

import { Button, Flex, Link, Spacer, Stack, Text } from '@chakra-ui/react'
import { parseEther } from 'viem'
import { useAccount, useReadContract, useSimulateContract, useWriteContract } from 'wagmi'
import { optimism, sepolia } from 'wagmi/chains'

import { useAppKitAccount } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { abi, address } from '@/src/utils/DonutContract'

const ALLOWED_CHAINS = [sepolia.id, optimism.id] as number[]

export function WagmiWriteContractTest() {
  const { address: accountAddress } = useAppKitAccount({ namespace: 'eip155' })
  const { status, chain } = useAccount()

  return ALLOWED_CHAINS.includes(Number(chain?.id)) && status === 'connected' ? (
    <AvailableTestContent accountAddress={accountAddress} />
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Sepolia or OP to test this feature
    </Text>
  )
}

function AvailableTestContent({ accountAddress }: { accountAddress: string | undefined }) {
  const toast = useChakraToast()
  const {
    data: donutsOwned,
    refetch: fetchDonutsOwned,
    isLoading: donutsQueryLoading,
    isRefetching: donutsQueryRefetching
  } = useReadContract({
    abi,
    address,
    functionName: 'getBalance',
    args: [accountAddress],
    query: {
      refetchOnWindowFocus: false
    }
  })
  const {
    refetch: simulateContract,
    data: simulateData,
    isFetching: simulateFetching
  } = useSimulateContract({
    abi,
    address,
    functionName: 'purchase',
    value: parseEther('0.00001'),
    args: [1],
    query: {
      enabled: false
    }
  })
  const { writeContract, reset, data, error, isPending } = useWriteContract()

  const onSendTransaction = useCallback(async () => {
    const { data: localSimulateData, error: simulateError } = await simulateContract()

    if (simulateError || !localSimulateData?.request) {
      toast({
        title: 'Error',
        description: 'Not able to execute this transaction. Check your balance.',
        type: 'error'
      })
    } else {
      writeContract(localSimulateData.request)
      await fetchDonutsOwned()
    }
  }, [writeContract, simulateContract])

  useEffect(() => {
    if (data) {
      toast({
        title: 'Donut Purchase Success!',
        description: data,
        type: 'success'
      })
    } else if (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase donut',
        type: 'error'
      })
    }
    reset()
  }, [data, error])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-testid="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={!simulateData?.request}
        isDisabled={isPending}
        isLoading={simulateFetching}
      >
        Purchase crypto donut
      </Button>

      {donutsQueryLoading || donutsQueryRefetching ? (
        <Text>Fetching donuts...</Text>
      ) : (
        <Flex alignItems="center">
          <Text marginRight="5px">Crypto donuts left:</Text>
          <Text>{donutsOwned?.toString()}</Text>
        </Flex>
      )}
      <Spacer />

      <Link isExternal href="https://sepoliafaucet.com">
        <Button variant="outline" colorScheme="blue" isDisabled={isPending}>
          Sepolia Faucet 1
        </Button>
      </Link>

      <Link isExternal href="https://www.infura.io/faucet/sepolia">
        <Button variant="outline" colorScheme="orange" isDisabled={isPending}>
          Sepolia Faucet 2
        </Button>
      </Link>
    </Stack>
  )
}
