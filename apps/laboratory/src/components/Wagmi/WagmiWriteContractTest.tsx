import { useToast } from '@chakra-ui/react'
import { parseEther } from 'viem'
import { useAccount, useSimulateContract, useWriteContract, useReadContract } from 'wagmi'
import { useCallback, useEffect } from 'react'
import { optimism, sepolia } from 'wagmi/chains'
import { abi, address } from '../../utils/DonutContract'
import { Span } from '@/components/ui/typography'
import { Column } from '@/components/ui/column'
import { Button, buttonVariants } from '@/components/ui/button'
import { Row } from '@/components/ui/row'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function WagmiWriteContractTest() {
  const toast = useToast()
  const { status, chain, address: accountAddress } = useAccount()
  const {
    data: donutsOwned,
    refetch: fetchDonutsOwned,
    isLoading: donutsQueryLoading,
    isRefetching: donutsQueryRefetching
  } = useReadContract({
    abi,
    address,
    functionName: 'getBalance',
    args: [accountAddress]
  })
  const { data: simulateData, error: simulateError } = useSimulateContract({
    abi,
    address,
    functionName: 'purchase',
    value: parseEther('0.0001'),
    args: [1]
  })
  const { writeContract, reset, data, error, isPending } = useWriteContract()
  const isConnected = status === 'connected'

  const onSendTransaction = useCallback(async () => {
    if (simulateError || !simulateData?.request) {
      toast({
        title: 'Error',
        description: 'Not able to execute this transaction. Check your balance.',
        status: 'error',
        isClosable: true
      })
    } else {
      writeContract(simulateData?.request)
      await fetchDonutsOwned()
    }
  }, [writeContract, simulateError, simulateData?.request])

  useEffect(() => {
    if (data) {
      toast({
        title: 'Donut Purchase Success!',
        description: data,
        status: 'success',
        isClosable: true
      })
    } else if (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase donut',
        status: 'error',
        isClosable: true
      })
    }
    reset()
  }, [data, error])

  const allowedChains = [sepolia.id, optimism.id] as number[]

  return allowedChains.includes(Number(chain?.id)) && status === 'connected' ? (
    <Column className="sm:flex-row sm:items-center w-full gap-4 justify-between">
      <Row className="gap-2 items-center">
        <Button
          data-test-id="sign-transaction-button"
          onClick={onSendTransaction}
          disabled={!simulateData?.request}
          variant={'secondary'}
        >
          Purchase crypto donut
        </Button>
        {donutsQueryLoading || donutsQueryRefetching ? (
          <Span className="mt-0">Fetching donuts...</Span>
        ) : (
          <Span className="mt-0">Crypto donuts left: {donutsOwned?.toString()}</Span>
        )}
      </Row>

      <Row className="gap-2">
        <Link
          className={cn(buttonVariants({ variant: 'outline' }))}
          target="_blank"
          href="https://sepoliafaucet.com"
        >
          Sepolia Faucet 1
        </Link>

        <Link
          className={cn(buttonVariants({ variant: 'outline' }))}
          target="_blank"
          href="https://www.infura.io/faucet/sepolia"
        >
          Sepolia Faucet 2
        </Link>
      </Row>
    </Column>
  ) : (
    <Span className="text-red-700 dark:text-red-400">
      Switch to Sepolia or OP to test this feature
    </Span>
  )
}
