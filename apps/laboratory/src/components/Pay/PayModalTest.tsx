import { Button, Code, Stack, Text } from '@chakra-ui/react'

import type { PaymentAsset } from '@reown/appkit-pay'
import { usePay } from '@reown/appkit-pay/react'

import { useChakraToast } from '../Toast'

interface PayModalTestProps {
  recipient: string
  amount: number
  asset: PaymentAsset
}

export function PayModalTest({ recipient, amount, asset }: PayModalTestProps) {
  const toast = useChakraToast()

  const { open, isPending, isSuccess, isError, error, data } = usePay({
    onSuccess: result => {
      toast({
        title: 'Payment Succeeded',
        description: `Transaction: ${result}`,
        type: 'success'
      })
    },
    onError: err => {
      toast({
        title: 'Payment Failed',
        description: err,
        type: 'error'
      })
    }
  })

  async function handleOpenPay() {
    if (!recipient) {
      toast({
        title: 'Missing Recipient',
        description: 'Please enter a recipient address',
        type: 'error'
      })

      return
    }

    await open({
      recipient,
      amount,
      paymentAsset: asset
    })
  }

  return (
    <Stack spacing="3">
      <Button
        data-testid="pay-modal-button"
        onClick={handleOpenPay}
        isLoading={isPending}
        isDisabled={!recipient}
      >
        Open Pay Modal (usePay Hook)
      </Button>

      {isSuccess && data && (
        <Code colorScheme="green" p={2}>
          Success: {data}
        </Code>
      )}

      {isError && error && (
        <Code colorScheme="red" p={2}>
          Error: {error}
        </Code>
      )}

      {isPending && <Text color="gray.500">Payment in progress...</Text>}
    </Stack>
  )
}
