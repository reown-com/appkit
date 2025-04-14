'use client'

import { useState } from 'react'

import {
  Box,
  Button,
  ButtonGroup,
  CardBody,
  CardHeader,
  Collapse,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  Spinner,
  Stack,
  useDisclosure
} from '@chakra-ui/react'
import { Card } from '@chakra-ui/react'

import type { AppKitPayErrorMessage, PayResult, PaymentAsset } from '@reown/appkit-pay'
import { usePay } from '@reown/appkit-pay/react'

import { useChakraToast } from './Toast'

interface Metadata {
  name: string
  symbol: string
  decimals: number
}

interface AppKitPaymentAssetState {
  network: string
  recipient: string
  asset: string
  amount: number
  metadata: Metadata
}

type PresetKey = 'NATIVE_BASE' | 'NATIVE_BASE_SEPOLIA' | 'USDC_BASE'

const PRESETS: Record<PresetKey, Omit<AppKitPaymentAssetState, 'recipient'>> = {
  NATIVE_BASE: {
    network: 'eip155:8453',
    asset: 'native',
    amount: 0.00001,
    metadata: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  NATIVE_BASE_SEPOLIA: {
    network: 'eip155:84532',
    asset: 'native',
    amount: 0.00001,
    metadata: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  USDC_BASE: {
    network: 'eip155:8453',
    asset: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    amount: 20,
    metadata: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6
    }
  }
}

export function AppKitPay() {
  const { isOpen, onToggle } = useDisclosure()
  const toast = useChakraToast()

  function handleSuccess(resultData: PayResult) {
    toast({
      title: 'Transaction successful',
      description: resultData.type === 'wallet' ? resultData.result : resultData.exchangeId,
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

  const [paymentDetails, setPaymentDetails] = useState<AppKitPaymentAssetState>({
    network: 'eip155:8453',
    recipient: '',
    asset: 'native',
    amount: 0.00001,
    metadata: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  })

  function isPresetActive(preset: Omit<AppKitPaymentAssetState, 'recipient'>): boolean {
    return (
      paymentDetails.network === preset.network &&
      paymentDetails.asset === preset.asset &&
      paymentDetails.amount === preset.amount &&
      paymentDetails.metadata.name === preset.metadata.name &&
      paymentDetails.metadata.symbol === preset.metadata.symbol &&
      paymentDetails.metadata.decimals === preset.metadata.decimals
    )
  }

  function handlePresetClick(preset: Omit<AppKitPaymentAssetState, 'recipient'>) {
    setPaymentDetails(prev => ({
      ...preset,
      recipient: prev.recipient
    }))
  }

  async function handleOpenPay() {
    if (!paymentDetails.recipient) {
      toast({ title: 'Missing Recipient', description: 'Please enter a recipient address.' })

      return
    }
    if (!/^0x[a-fA-F0-9]{40}$/u.test(paymentDetails.recipient)) {
      toast({ title: 'Invalid Recipient', description: 'Please enter a valid Ethereum address.' })

      return
    }

    const paymentAsset: PaymentAsset = {
      ...paymentDetails,
      network: paymentDetails.network as PaymentAsset['network'],
      asset: paymentDetails.asset as PaymentAsset['asset'],
      amount: paymentDetails.amount
    }

    await open({
      paymentAsset
    })
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    if (name.startsWith('metadata.')) {
      const key = name.split('.')[1] as keyof Metadata
      const processedValue = key === 'decimals' ? parseInt(value, 10) || 0 : value
      setPaymentDetails((prev: AppKitPaymentAssetState) => ({
        ...prev,
        metadata: { ...prev.metadata, [key]: processedValue }
      }))
    } else {
      const fieldName = name as keyof Omit<AppKitPaymentAssetState, 'metadata'>
      const processedValue: string | number = value
      setPaymentDetails((prev: AppKitPaymentAssetState) => ({
        ...prev,
        [fieldName]: processedValue
      }))
    }
  }

  function handleAmountChange(_valueAsString: string, valueAsNumber: number) {
    setPaymentDetails((prev: AppKitPaymentAssetState) => ({
      ...prev,
      amount: isNaN(valueAsNumber) ? 0 : valueAsNumber
    }))
  }

  function handleDecimalsChange(_valueAsString: string, valueAsNumber: number) {
    setPaymentDetails((prev: AppKitPaymentAssetState) => ({
      ...prev,
      metadata: { ...prev.metadata, decimals: isNaN(valueAsNumber) ? 0 : valueAsNumber }
    }))
  }

  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Pay Interactions</Heading>
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
                    value={paymentDetails.network}
                    onChange={handleInputChange}
                  />
                  <FormHelperText>Example: eip155:8453 (Base Mainnet)</FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Asset Address</FormLabel>
                  <Input name="asset" value={paymentDetails.asset} onChange={handleInputChange} />
                  <FormHelperText>
                    Example: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913 (USDC on Base)
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Amount</FormLabel>
                  <NumberInput
                    name="amount"
                    value={paymentDetails.amount.toString()}
                    onChange={handleAmountChange}
                    min={0}
                    precision={paymentDetails.metadata.decimals}
                    step={1 / 10 ** paymentDetails.metadata.decimals}
                  >
                    <NumberInputField />
                  </NumberInput>
                  <FormHelperText>Example: 20 (Input as float)</FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Metadata: Name</FormLabel>
                  <Input
                    name="metadata.name"
                    value={paymentDetails.metadata.name}
                    onChange={handleInputChange}
                  />
                  <FormHelperText>Example: USDC</FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Metadata: Symbol</FormLabel>
                  <Input
                    name="metadata.symbol"
                    value={paymentDetails.metadata.symbol}
                    onChange={handleInputChange}
                  />
                  <FormHelperText>Example: USDC</FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Metadata: Decimals</FormLabel>
                  <NumberInput
                    name="metadata.decimals"
                    value={paymentDetails.metadata.decimals}
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

          <Button
            onClick={handleOpenPay}
            isDisabled={
              !paymentDetails.recipient ||
              !/^0x[a-fA-F0-9]{40}$/u.test(paymentDetails.recipient) ||
              isPending
            }
          >
            {isPending ? <Spinner /> : 'Open Pay'}
          </Button>
        </Stack>
      </CardBody>
    </Card>
  )
}
