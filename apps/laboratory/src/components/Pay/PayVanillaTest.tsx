import { useState } from 'react'

import { Button, Code, Stack, Text } from '@chakra-ui/react'

import type { PaymentAsset } from '@reown/appkit-pay'
import { pay } from '@reown/appkit-pay'

import { useChakraToast } from '../Toast'

interface PayVanillaTestProps {
  recipient: string
  amount: number
  asset: PaymentAsset
}

export function PayVanillaTest({ recipient, amount, asset }: PayVanillaTestProps) {
  const toast = useChakraToast()
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    if (!recipient) {
      toast({
        title: 'Missing Recipient',
        description: 'Please enter a recipient address',
        type: 'error'
      })

      return
    }

    setIsPending(true)
    setResult(null)
    setError(null)

    try {
      const paymentResult = await pay({
        recipient,
        amount,
        paymentAsset: asset
      })

      if (paymentResult.success) {
        setResult(paymentResult.result ?? 'Success')
        toast({
          title: 'Payment Succeeded',
          description: `Transaction: ${paymentResult.result}`,
          type: 'success'
        })
      } else {
        setError(paymentResult.error ?? 'Payment failed')
        toast({
          title: 'Payment Failed',
          description: paymentResult.error,
          type: 'error'
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        type: 'error'
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Stack spacing="3">
      <Button
        data-testid="pay-vanilla-button"
        onClick={handlePay}
        isLoading={isPending}
        isDisabled={!recipient}
      >
        Pay with Promise (Vanilla JS)
      </Button>

      {result && (
        <Code colorScheme="green" p={2}>
          Success: {result}
        </Code>
      )}

      {error && (
        <Code colorScheme="red" p={2}>
          Error: {error}
        </Code>
      )}

      {isPending && <Text color="gray.500">Waiting for payment to complete...</Text>}
    </Stack>
  )
}
