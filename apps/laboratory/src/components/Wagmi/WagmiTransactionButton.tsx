import { Button } from '@chakra-ui/react'
import { parseEther } from 'viem'
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import { vitalikEthAddress } from '../../utils/DataUtil'

// Component
export function WagmiTransactionButton() {
  const { config } = usePrepareSendTransaction({
    to: vitalikEthAddress,
    value: parseEther('0.1', 'gwei')
  })
  const { sendTransaction } = useSendTransaction(config)

  function onSendTransaction() {
    sendTransaction?.()
  }

  return (
    <>
      <Button data-test-id="sign-transaction-button" onClick={onSendTransaction}>
        Send Transaction
      </Button>
    </>
  )
}
