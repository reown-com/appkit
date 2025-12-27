import { useEffect } from 'react'

import { Alert, AlertIcon, Button, Image, Spinner, Stack, Text } from '@chakra-ui/react'

import type { Exchange, PayUrlParams, PaymentAsset } from '@reown/appkit-pay'
import { useAvailableExchanges, usePayUrlActions } from '@reown/appkit-pay/react'

import { useChakraToast } from '../Toast'

interface PayExchangesListProps {
  recipient: string
  amount: number
  asset: PaymentAsset
  onSessionStart: (exchangeId: string, sessionId: string, exchangeName: string) => void
  isStatusCheckActive: boolean
}

export function PayExchangesList({
  recipient,
  amount,
  asset,
  onSessionStart,
  isStatusCheckActive
}: PayExchangesListProps) {
  const toast = useChakraToast()
  const {
    data: exchanges,
    isLoading,
    error,
    fetch
  } = useAvailableExchanges({
    shouldFetchOnInit: false
  })
  const { openUrl } = usePayUrlActions()

  useEffect(() => {
    if (error) {
      toast({
        title: 'Failed to Load Exchanges',
        description: error.message,
        type: 'error'
      })
    }
  }, [error, toast])

  async function handleOpenExchange(exchange: Exchange) {
    if (!recipient) {
      toast({
        title: 'Missing Recipient',
        description: 'Please enter a recipient address',
        type: 'error'
      })

      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/u.test(recipient)) {
      toast({
        title: 'Invalid Recipient',
        description: 'Please enter a valid Ethereum address',
        type: 'error'
      })

      return
    }

    const params: PayUrlParams = {
      network: asset.network as `eip155:${string}`,
      asset: asset.asset,
      amount: amount.toString(),
      recipient
    }

    try {
      const result = await openUrl(exchange.id, params, true)

      if (result.sessionId) {
        onSessionStart(exchange.id, result.sessionId, exchange.name)
      } else {
        toast({
          title: 'Session ID Missing',
          description: 'Could not start status check',
          type: 'error'
        })
      }
    } catch (err) {
      toast({
        title: 'Failed to Open Exchange',
        description: err instanceof Error ? err.message : String(err),
        type: 'error'
      })
    }
  }

  return (
    <Stack spacing="3">
      <Button onClick={() => fetch()} isLoading={isLoading} isDisabled={isStatusCheckActive}>
        {exchanges ? 'Refresh' : 'Fetch'} Exchanges
      </Button>

      {isLoading && (
        <Stack align="center" py={4}>
          <Spinner />
          <Text color="gray.500">Loading exchanges...</Text>
        </Stack>
      )}

      {error && !isLoading && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}

      {exchanges && exchanges.length > 0 && (
        <Stack spacing="2">
          {exchanges.map(exchange => (
            <Button
              key={exchange.id}
              onClick={() => handleOpenExchange(exchange)}
              isDisabled={
                isStatusCheckActive || !recipient || !/^0x[a-fA-F0-9]{40}$/u.test(recipient)
              }
              leftIcon={
                <Image
                  src={exchange.imageUrl}
                  alt={exchange.name}
                  boxSize="20px"
                  borderRadius="sm"
                />
              }
              justifyContent="flex-start"
              variant="outline"
            >
              {exchange.name}
            </Button>
          ))}
        </Stack>
      )}

      {exchanges && exchanges.length === 0 && <Text color="gray.500">No exchanges available</Text>}

      {!exchanges && !isLoading && !error && (
        <Text color="gray.500">Click "Fetch Exchanges" to load options</Text>
      )}
    </Stack>
  )
}
