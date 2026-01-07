import { Alert, AlertIcon, Box, Button, Code, Spinner, Stack, Text } from '@chakra-ui/react'

import type { ExchangeBuyStatus } from '@reown/appkit-pay/react'
import { useExchangeBuyStatus } from '@reown/appkit-pay/react'

import { useChakraToast } from '../Toast'

interface PayStatusTrackerProps {
  exchangeId: string
  sessionId: string
  exchangeName: string
  onStop: () => void
}

export function PayStatusTracker({
  exchangeId,
  sessionId,
  exchangeName,
  onStop
}: PayStatusTrackerProps) {
  const toast = useChakraToast()

  const {
    data: status,
    isLoading,
    error,
    refetch
  } = useExchangeBuyStatus({
    exchangeId,
    sessionId,
    pollingInterval: 5000,
    isEnabled: true,
    onSuccess: (result: ExchangeBuyStatus) => {
      if (result.status === 'SUCCESS') {
        toast({
          title: 'Payment Succeeded',
          description: `Tx: ${result.txHash ?? 'N/A'}`,
          type: 'success'
        })
      } else if (result.status === 'FAILED') {
        toast({
          title: 'Payment Failed',
          description: 'The exchange reported a failure',
          type: 'error'
        })
      }
    },
    onError: (err: Error) => {
      toast({
        title: 'Status Check Error',
        description: err.message,
        type: 'error'
      })
    }
  })

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <Stack spacing="3">
        <Box>
          <Text fontWeight="bold">Tracking: {exchangeName}</Text>
          <Text color="gray.500">Session: ...{sessionId.slice(-8)}</Text>
        </Box>

        {isLoading && !status && !error && (
          <Stack direction="row" align="center" spacing={2}>
            <Spinner size="sm" />
            <Text>Checking status...</Text>
          </Stack>
        )}

        {error && (
          <Alert status="error">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="medium">Error</Text>
              <Text>{error.message}</Text>
            </Box>
            <Button size="xs" onClick={refetch} isDisabled={isLoading}>
              Retry
            </Button>
          </Alert>
        )}

        {status && (
          <Stack spacing="2">
            <Box>
              <Text fontWeight="medium">
                Status:{' '}
                <Text
                  as="span"
                  color={
                    // eslint-disable-next-line no-nested-ternary
                    status.status === 'SUCCESS'
                      ? 'green.500'
                      : status.status === 'FAILED'
                        ? 'red.500'
                        : 'blue.500'
                  }
                >
                  {status.status}
                </Text>
              </Text>
            </Box>

            {status.txHash && <Code p={2}>Tx: {status.txHash}</Code>}

            {status.status === 'IN_PROGRESS' && !isLoading && (
              <Text color="gray.500">Polling every 5 seconds...</Text>
            )}

            {(status.status === 'SUCCESS' || status.status === 'FAILED') && (
              <Text color="gray.500">Polling stopped (terminal state)</Text>
            )}
          </Stack>
        )}

        <Button variant="outline" colorScheme="red" onClick={onStop}>
          Stop Tracking
        </Button>
      </Stack>
    </Box>
  )
}
