import { Button, useToast } from '@chakra-ui/react'
import { parseEther } from 'viem'
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { useCallback, useEffect } from 'react'

// Component
export function WagmiTransactionButton() {
  const toast = useToast()
  const { config, error: prepareError } = usePrepareSendTransaction({
    to: vitalikEthAddress,
    value: parseEther('0.0001', 'gwei')
  })

  const { sendTransaction, data, error, reset } = useSendTransaction(config)

  const onSendTransaction = useCallback(() => {
    if (prepareError) {
      toast({
        title: 'Error',
        description: 'Not enough funds to send transaction',
        status: 'error',
        isClosable: true
      })
    } else {
      sendTransaction?.()
    }
  }, [sendTransaction, prepareError])

  useEffect(() => {
    if (data) {
      toast({
        title: 'Transaction Success',
        description: data.hash,
        status: 'success',
        isClosable: true
      })
    } else if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send transaction',
        status: 'error',
        isClosable: true
      })
    }
    reset()
  }, [data, error])

  return (
    <>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={!sendTransaction}
      >
        Send Transaction
      </Button>
    </>
  )
}
