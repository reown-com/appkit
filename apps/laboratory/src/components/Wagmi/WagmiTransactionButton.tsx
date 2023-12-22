import { Button } from '@chakra-ui/react'
import { parseEther } from 'viem'
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'

// Component
export function WagmiTransactionButton() {
  const { config } = usePrepareSendTransaction({
    to: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    value: parseEther('0.1', 'gwei')
  })
  const { sendTransaction } = useSendTransaction(config)

  function onSendTransaction() {
    sendTransaction?.()
  }

  return (
    <>
      <>
        <Button data-test-id="sign-transaction-button" onClick={() => onSendTransaction()}>
          Send Transaction
        </Button>
      </>
    </>
  )
}
