'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  ButtonGroup,
  CardBody,
  CardHeader,
  Collapse,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Image,
  Input,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import { Card } from '@chakra-ui/react'

import type { CaipNetworkId } from '@reown/appkit-common'
import type {
  AppKitPayErrorMessage,
  Exchange,
  PayResult,
  PayUrlParams,
  PaymentAsset
} from '@reown/appkit-pay'
import { baseETH, baseSepoliaETH, baseUSDC } from '@reown/appkit-pay'
import {
  type ExchangeBuyStatus,
  useAvailableExchanges,
  useExchangeBuyStatus,
  usePay,
  usePayUrlActions
} from '@reown/appkit-pay/react'

import { useChakraToast } from './Toast'

interface AppKitPaymentAssetState {
  recipient: string
  amount: number
  asset: PaymentAsset
}

type PresetKey = 'NATIVE_BASE' | 'NATIVE_BASE_SEPOLIA' | 'USDC_BASE' | 'USDC_SOLANA'

const PRESETS: Record<PresetKey, Omit<AppKitPaymentAssetState, 'recipient'>> = {
  NATIVE_BASE: {
    asset: baseETH,
    amount: 0.00001
  },
  NATIVE_BASE_SEPOLIA: {
    asset: baseSepoliaETH,
    amount: 0.00001
  },
  USDC_BASE: {
    asset: baseUSDC,
    amount: 12
  },
  USDC_SOLANA: {
    asset: {
      network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' as CaipNetworkId,
      asset: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      metadata: {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6
      }
    },
    amount: 1
  }
}

interface ActiveStatusCheck {
  exchangeId: string
  sessionId: string
  exchangeName: string
}

export function AppKitPay() {
  const { isOpen, onToggle } = useDisclosure()
  const toast = useChakraToast()

  function handleSuccess(resultData: PayResult) {
    toast({
      title: 'Transaction successful',
      description: resultData,
      type: 'success'
    })
  }

  function handleError(errorData: AppKitPayErrorMessage) {
    toast({
      title: 'Transaction failed',
      description: errorData,
      type: 'error'
    })
  }

  const { open, isPending } = usePay({
    onSuccess: handleSuccess,
    onError: handleError
  })

  const {
    data: fetchedExchangesData,
    isLoading: isLoadingExchanges,
    error: errorExchanges,
    fetch: triggerFetchExchanges
  } = useAvailableExchanges({ shouldFetchOnInit: false })
  const { openUrl } = usePayUrlActions()
  const [displayedExchanges, setDisplayedExchanges] = useState<Exchange[] | null>(null)

  const [paymentDetails, setPaymentDetails] = useState<AppKitPaymentAssetState>(() => {
    let initialRecipient = ''
    if (typeof window !== 'undefined') {
      initialRecipient = localStorage.getItem('appkitPayRecipient') || ''
    }

    return {
      recipient: initialRecipient,
      asset: baseETH,
      amount: 0.00001
    }
  })

  const [amountDisplayValue, setAmountDisplayValue] = useState<string>(() =>
    paymentDetails.amount.toString()
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appkitPayRecipient', paymentDetails.recipient)
    }
  }, [paymentDetails.recipient])

  const [activeCheck, setActiveCheck] = useState<ActiveStatusCheck | null>(null)

  function isPresetActive(preset: Omit<AppKitPaymentAssetState, 'recipient'>): boolean {
    return paymentDetails.asset === preset.asset && paymentDetails.amount === preset.amount
  }

  function handlePresetClick(preset: Omit<AppKitPaymentAssetState, 'recipient'>) {
    setPaymentDetails(prev => ({
      ...preset,
      recipient: prev.recipient
    }))
    setAmountDisplayValue(preset.amount.toString())
  }

  const handleSuccessStatus = useCallback(
    (status: ExchangeBuyStatus) => {
      if (status.status === 'SUCCESS') {
        toast({
          title: 'Payment Succeeded',
          description: `Tx: ${status.txHash ?? 'N/A'}`,
          type: 'success'
        })
      } else if (status.status === 'FAILED') {
        toast({
          title: 'Payment Failed',
          description: 'The exchange reported a failure.',
          type: 'error'
        })
      }
    },
    [toast]
  )

  const handleErrorStatus = useCallback(
    (err: Error) => {
      toast({ title: 'Status Check Error', description: err.message, type: 'error' })
    },
    [toast]
  )

  const {
    data: statusCheckResult,
    isLoading: isStatusCheckLoading,
    error: statusCheckError,
    refetch: refetchStatus
  } = useExchangeBuyStatus({
    exchangeId: activeCheck?.exchangeId ?? '',
    sessionId: activeCheck?.sessionId ?? '',
    pollingInterval: 5000,
    isEnabled: Boolean(activeCheck),
    onSuccess: handleSuccessStatus,
    onError: handleErrorStatus
  })

  async function handleOpenPay() {
    if (!paymentDetails.recipient) {
      toast({ title: 'Missing Recipient', description: 'Please enter a recipient address.' })

      return
    }

    await open({
      recipient: paymentDetails.recipient,
      amount: paymentDetails.amount,
      paymentAsset: paymentDetails.asset
    })
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setPaymentDetails((prev: AppKitPaymentAssetState) => {
        const newDetails = { ...prev }
        switch (name) {
          case 'recipient':
            newDetails.recipient = value
            break
          case 'network':
            newDetails.asset = { ...newDetails.asset, network: value as CaipNetworkId }
            break
          case 'asset':
            newDetails.asset = { ...newDetails.asset, asset: value }
            break
          case 'metadata.name':
            newDetails.asset = {
              ...newDetails.asset,
              metadata: { ...newDetails.asset.metadata, name: value }
            }
            break
          case 'metadata.symbol':
            newDetails.asset = {
              ...newDetails.asset,
              metadata: { ...newDetails.asset.metadata, symbol: value }
            }
            break
          default:
            break
        }

        return newDetails
      })
    },
    [setPaymentDetails]
  )

  function handleAmountChange(valueAsString: string, valueAsNumber: number) {
    setAmountDisplayValue(valueAsString)
    setPaymentDetails((prev: AppKitPaymentAssetState) => ({
      ...prev,
      amount: isNaN(valueAsNumber) ? 0 : valueAsNumber
    }))
  }

  function handleDecimalsChange(_valueAsString: string, valueAsNumber: number) {
    setPaymentDetails((prev: AppKitPaymentAssetState) => ({
      ...prev,
      asset: {
        ...prev.asset,
        metadata: { ...prev.asset.metadata, decimals: isNaN(valueAsNumber) ? 0 : valueAsNumber }
      }
    }))
  }

  async function handleOpenPayUrl(exchangeId: string) {
    if (activeCheck) {
      toast({
        title: 'Check in Progress',
        description: 'Please wait for the current status check to complete or stop it.'
      })

      return
    }
    if (!paymentDetails.recipient) {
      toast({ title: 'Missing Recipient', description: 'Please enter a recipient address.' })

      return
    }
    if (!/^0x[a-fA-F0-9]{40}$/u.test(paymentDetails.recipient)) {
      toast({ title: 'Invalid Recipient', description: 'Please enter a valid Ethereum address.' })

      return
    }

    const params: PayUrlParams = {
      network: paymentDetails.asset.network as `eip155:${string}`,
      asset: paymentDetails.asset.asset,
      amount: paymentDetails.amount.toString(),
      recipient: paymentDetails.recipient
    }

    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      const result = await openUrl(exchangeId, params, true)

      if (result.sessionId) {
        const exchangeName =
          displayedExchanges?.find(ex => ex.id === exchangeId)?.name ?? exchangeId
        setActiveCheck({ exchangeId, sessionId: result.sessionId, exchangeName })
      } else {
        toast({ title: 'Session ID Missing', description: 'Could not start status check.' })
      }
    } catch (error) {
      toast({
        title: 'Failed to open Pay URL',
        description: error instanceof Error ? error.message : String(error),
        type: 'error'
      })
      setActiveCheck(null)
    }
  }

  async function handleFetchExchanges() {
    setDisplayedExchanges(null)
    try {
      await triggerFetchExchanges()
    } catch (err) {
      setDisplayedExchanges(null)
      toast({
        title: 'Fetch Trigger Failed',
        description: err instanceof Error ? err.message : String(err),
        type: 'error'
      })
    }
  }

  useEffect(() => {
    if (!isLoadingExchanges) {
      if (errorExchanges) {
        setDisplayedExchanges(null)
        toast({
          title: 'Fetch Failed',
          description: errorExchanges.message,
          type: 'error'
        })
      } else if (fetchedExchangesData) {
        setDisplayedExchanges(fetchedExchangesData)
      } else {
        setDisplayedExchanges(null)
      }
    }
  }, [fetchedExchangesData, isLoadingExchanges, errorExchanges])

  function handleClearExchanges() {
    setDisplayedExchanges(null)
    setActiveCheck(null)
  }

  function handleStopCheck() {
    setActiveCheck(null)
  }

  return (
    <>
      <Card marginTop={10} marginBottom={10}>
        <CardHeader>
          <Heading size="md">Pay Configuration</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing="4">
            <FormControl isRequired>
              <FormLabel>Recipient Address</FormLabel>
              <Input
                placeholder="0x..."
                name="recipient"
                value={paymentDetails.recipient}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Presets</FormLabel>
              <ButtonGroup spacing="4" width="full">
                <Button
                  onClick={() => handlePresetClick(PRESETS['NATIVE_BASE'])}
                  isActive={isPresetActive(PRESETS['NATIVE_BASE'])}
                  variant={isPresetActive(PRESETS['NATIVE_BASE']) ? 'solid' : 'outline'}
                  flex="1"
                >
                  Native Base
                </Button>
                <Button
                  onClick={() => handlePresetClick(PRESETS['NATIVE_BASE_SEPOLIA'])}
                  isActive={isPresetActive(PRESETS['NATIVE_BASE_SEPOLIA'])}
                  variant={isPresetActive(PRESETS['NATIVE_BASE_SEPOLIA']) ? 'solid' : 'outline'}
                  flex="1"
                >
                  Native Base Sepolia
                </Button>
                <Button
                  onClick={() => handlePresetClick(PRESETS['USDC_BASE'])}
                  isActive={isPresetActive(PRESETS['USDC_BASE'])}
                  variant={isPresetActive(PRESETS['USDC_BASE']) ? 'solid' : 'outline'}
                  flex="1"
                >
                  USDC Base
                </Button>
                <Button
                  onClick={() => handlePresetClick(PRESETS['USDC_SOLANA'])}
                  isActive={isPresetActive(PRESETS['USDC_SOLANA'])}
                  variant={isPresetActive(PRESETS['USDC_SOLANA']) ? 'solid' : 'outline'}
                  flex="1"
                >
                  USDC Solana
                </Button>
              </ButtonGroup>
            </FormControl>

            <Button onClick={onToggle} variant="outline" width="full">
              {isOpen ? 'Hide' : 'Show'} Asset Configuration
            </Button>

            <Collapse in={isOpen} animateOpacity>
              <Box mt={4}>
                <Stack spacing="4">
                  <FormControl>
                    <FormLabel>Network (Chain ID)</FormLabel>
                    <Input
                      name="network"
                      value={paymentDetails.asset.network}
                      onChange={handleInputChange}
                    />
                    <FormHelperText>Example: eip155:8453 (Base Mainnet)</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Asset Address</FormLabel>
                    <Input
                      name="asset"
                      value={paymentDetails.asset.asset}
                      onChange={handleInputChange}
                    />
                    <FormHelperText>
                      Example: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913 (USDC on Base)
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Amount</FormLabel>
                    <NumberInput value={amountDisplayValue} onChange={handleAmountChange} min={0}>
                      <NumberInputField />
                    </NumberInput>
                    <FormHelperText>Example: 20 (Input as float)</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Metadata: Name</FormLabel>
                    <Input
                      name="metadata.name"
                      value={paymentDetails.asset.metadata.name}
                      onChange={handleInputChange}
                    />
                    <FormHelperText>Example: USDC</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Metadata: Symbol</FormLabel>
                    <Input
                      name="metadata.symbol"
                      value={paymentDetails.asset.metadata.symbol}
                      onChange={handleInputChange}
                    />
                    <FormHelperText>Example: USDC</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Metadata: Decimals</FormLabel>
                    <NumberInput
                      name="metadata.decimals"
                      value={paymentDetails.asset.metadata.decimals}
                      onChange={handleDecimalsChange}
                      min={0}
                      precision={0}
                    >
                      <NumberInputField />
                    </NumberInput>
                    <FormHelperText>Example: 6 (for USDC)</FormHelperText>
                  </FormControl>
                </Stack>
              </Box>
            </Collapse>
          </Stack>
        </CardBody>
      </Card>

      <Card marginTop={10} marginBottom={10}>
        <CardHeader>
          <Heading size="md">Pay Interactions (Modal)</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing="4">
            <Button
              onClick={handleOpenPay}
              isDisabled={!paymentDetails.recipient || isPending}
              width="full"
            >
              {isPending ? <Spinner /> : 'Open Pay Modal'}
            </Button>

            <Text fontSize="sm" color="gray.500">
              Uses the Recipient Address and Asset Configuration from the form above.
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card marginTop={10} marginBottom={10}>
        <CardHeader>
          <Heading size="md">Pay Interactions (Headless)</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing="4">
            <FormControl>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <FormLabel mb="0">Exchanges</FormLabel>
                <ButtonGroup size="sm" isAttached variant="outline">
                  <Button
                    onClick={handleFetchExchanges}
                    isLoading={isLoadingExchanges}
                    isDisabled={Boolean(activeCheck)}
                  >
                    Fetch
                  </Button>
                  <Button
                    onClick={handleClearExchanges}
                    isDisabled={!displayedExchanges || isLoadingExchanges || Boolean(activeCheck)}
                  >
                    Clear
                  </Button>
                </ButtonGroup>
              </Box>
              {isLoadingExchanges && <Spinner mt={2} />}
              {errorExchanges && !isLoadingExchanges && (
                <Alert status="error" mt={2}>
                  <AlertIcon />
                  Failed to load exchanges: {errorExchanges.message}
                  <Button size="xs" ml="auto" onClick={() => triggerFetchExchanges()}>
                    Retry
                  </Button>
                </Alert>
              )}
              {!isLoadingExchanges &&
                !errorExchanges &&
                displayedExchanges &&
                displayedExchanges.length > 0 && (
                  <SimpleGrid columns={2} spacing={3} mt={2}>
                    {displayedExchanges.map((exchange: Exchange) => (
                      <Button
                        key={exchange.id}
                        variant="outline"
                        onClick={() => handleOpenPayUrl(exchange.id)}
                        isDisabled={
                          Boolean(activeCheck) ||
                          !paymentDetails.recipient ||
                          !/^0x[a-fA-F0-9]{40}$/u.test(paymentDetails.recipient)
                        }
                        leftIcon={
                          <Image
                            src={exchange.imageUrl}
                            alt={`${exchange.name} logo`}
                            boxSize="20px"
                            borderRadius="sm"
                          />
                        }
                        justifyContent="start"
                        height="40px"
                      >
                        {exchange.name}
                      </Button>
                    ))}
                  </SimpleGrid>
                )}
              {!isLoadingExchanges && !errorExchanges && !displayedExchanges && (
                <Text mt={2} color="gray.500">
                  Click 'Fetch' to load available options.
                </Text>
              )}
              {!isLoadingExchanges &&
                !errorExchanges &&
                displayedExchanges &&
                displayedExchanges.length === 0 && (
                  <Text mt={2} color="gray.500">
                    No exchanges found.
                  </Text>
                )}
            </FormControl>

            {activeCheck && (
              <>
                <Divider />
                <Box mt={4}>
                  <HStack justifyContent="space-between" mb={2}>
                    <Heading size="sm">
                      Status Check: {activeCheck.exchangeName} (Session: ...
                      {activeCheck.sessionId.slice(-6)})
                    </Heading>
                    <Button size="sm" onClick={handleStopCheck} variant="outline" colorScheme="red">
                      Stop Checking
                    </Button>
                  </HStack>

                  {isStatusCheckLoading && !statusCheckResult && !statusCheckError && (
                    <HStack>
                      <Spinner size="sm" />
                      <Text>Loading initial status...</Text>
                    </HStack>
                  )}

                  {statusCheckError && (
                    <Alert status="error" mt={2}>
                      <AlertIcon />
                      Error: {statusCheckError.message}
                      <Button
                        size="xs"
                        ml="auto"
                        onClick={refetchStatus}
                        isDisabled={isStatusCheckLoading}
                      >
                        Retry
                      </Button>
                    </Alert>
                  )}

                  {statusCheckResult && (
                    <Box borderWidth="1px" borderRadius="md" p={3} mt={2}>
                      <HStack justifyContent="space-between">
                        <Text fontWeight="medium">Current Status: {statusCheckResult.status}</Text>
                        {isStatusCheckLoading && <Spinner size="xs" />}
                      </HStack>
                      {statusCheckResult.txHash && (
                        <Text fontSize="sm" color="gray.600">
                          Transaction Hash: {statusCheckResult.txHash}
                        </Text>
                      )}
                      {(statusCheckResult.status === 'SUCCESS' ||
                        statusCheckResult.status === 'FAILED') && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Polling stopped.
                        </Text>
                      )}
                      {statusCheckResult.status === 'IN_PROGRESS' && !isStatusCheckLoading && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Polling for updates...
                        </Text>
                      )}
                    </Box>
                  )}
                </Box>
              </>
            )}

            <Text fontSize="sm" color="gray.500" mt={activeCheck ? 2 : 0}>
              Uses the Recipient Address and Asset Configuration from the form above. Click an
              exchange button above to open its payment page directly in a new tab.
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}
