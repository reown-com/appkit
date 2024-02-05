import { Button, useToast, Stack, Link, Text, Spacer, Flex } from '@chakra-ui/react'
import { parseEther } from 'viem'
import {
  useContractWrite,
  useNetwork,
  useAccount,
  usePrepareContractWrite,
  useContractRead
} from 'wagmi'
import { useCallback, useEffect } from 'react'
import { sepolia } from 'wagmi/chains'
import { abi, address } from '../../utils/DonutContract'

export function WagmiWriteContractTest() {
  const toast = useToast()
  const { chain } = useNetwork()
  const { status } = useAccount()
  const {
    data: donutsOwned,
    refetch: fetchDonutsOwned,
    isLoading: donutsQueryLoading,
    isRefetching: donutsQueryRefetching
  } = useContractRead({
    abi,
    address,
    functionName: 'getBalance'
  })
  const { config, error: prepareError } = usePrepareContractWrite({
    abi,
    address,
    functionName: 'purchase',
    value: parseEther('0.0003'),
    args: [1]
  })
  const { error, data, isLoading, write, reset } = useContractWrite(config)

  const onSendTransaction = useCallback(async () => {
    if (prepareError) {
      toast({
        title: 'Error',
        description: 'Not enough funds to purchase donut',
        status: 'error',
        isClosable: true
      })
    } else {
      write?.()
      await fetchDonutsOwned()
    }
  }, [write, prepareError])

  useEffect(() => {
    if (data) {
      toast({
        title: 'Donut Purchase Success!',
        description: data.hash,
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

  return chain?.id === sepolia.id && status === 'connected' ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={!write}
        isDisabled={isLoading}
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
        <Button variant="outline" colorScheme="blue" isDisabled={isLoading}>
          Sepolia Faucet 1
        </Button>
      </Link>

      <Link isExternal href="https://www.infura.io/faucet/sepolia">
        <Button variant="outline" colorScheme="orange" isDisabled={isLoading}>
          Sepolia Faucet 2
        </Button>
      </Link>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Sepolia Ethereum Testnet to test this feature
    </Text>
  )
}
