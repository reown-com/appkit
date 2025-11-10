import { useCallback, useState } from 'react'

import { AddIcon } from '@chakra-ui/icons'
import { Button, Link, Spacer, Stack, Text } from '@chakra-ui/react'
import { type Address, type Hex, parseGwei } from 'viem'
import { useAccount, useEstimateGas, useSendTransaction } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import { AddTransactionModal } from '@/src/components/AddTransactionModal'
import { useChakraToast } from '@/src/components/Toast'
import { vitalikEthAddress } from '@/src/utils/DataUtil'

const TEST_TX = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.001')
}

export function WagmiTransactionTest() {
  const { status, chain } = useAccount()

  return Number(chain?.id) !== mainnet.id && status === 'connected' ? (
    <AvailableTestContent />
  ) : (
    <Text fontSize="md" color="yellow">
      Feature not available on Ethereum Mainnet
    </Text>
  )
}

function AvailableTestContent() {
  const toast = useChakraToast()
  const [customTx, setCustomTx] = useState<{
    to: Address
    value: bigint
    data?: Hex
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const txToSend = customTx || TEST_TX

  const { refetch: estimateGas, isFetching: isEstimateGasFetching } = useEstimateGas({
    ...txToSend,
    query: {
      enabled: false
    }
  })
  const [isLoading, setLoading] = useState(false)

  const { sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: hash => {
        setLoading(false)
        toast({
          title: 'Transaction Success',
          description: hash,
          type: 'success'
        })
      },
      onError: error => {
        setLoading(false)
        toast({
          title: 'Error',
          description: error?.message || 'Failed to sign transaction',
          type: 'error'
        })
      }
    }
  })

  const onSendTransaction = useCallback(async () => {
    const { data: gas, error: prepareError } = await estimateGas()

    if (prepareError) {
      toast({
        title: 'Error',
        description: prepareError?.message || 'Failed to sign transaction',
        type: 'error'
      })
    } else {
      setLoading(true)
      sendTransaction({
        ...txToSend,
        gas
      })
    }
  }, [sendTransaction, estimateGas, txToSend])

  function onConfigureTransaction(params: { eth: string; to: string; data?: string }) {
    setCustomTx({
      to: params.to as Address,
      value: parseGwei(params.eth),
      data: params.data as Hex | undefined
    })
    setIsModalOpen(false)
  }

  function onCloseModal() {
    setIsModalOpen(false)
  }

  return (
    <>
      <Stack direction={['column', 'column', 'row']}>
        <Button
          data-testid="sign-transaction-button"
          onClick={onSendTransaction}
          disabled={!sendTransaction}
          isDisabled={isLoading}
          isLoading={isEstimateGasFetching}
        >
          {customTx ? 'Send Custom Transaction' : 'Send Transaction to Vitalik'}
        </Button>

        <Button
          variant="outline"
          colorScheme="blue"
          onClick={() => setIsModalOpen(true)}
          isDisabled={isLoading}
        >
          <AddIcon mr={2} /> Configure Transaction
        </Button>

        {customTx && (
          <Button
            variant="outline"
            colorScheme="red"
            onClick={() => setCustomTx(null)}
            isDisabled={isLoading}
          >
            Reset to Default
          </Button>
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
      <AddTransactionModal
        isOpen={isModalOpen}
        onSubmit={onConfigureTransaction}
        onClose={onCloseModal}
      />
    </>
  )
}
