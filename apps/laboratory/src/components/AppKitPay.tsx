'use client'

import { useEffect, useState } from 'react'

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

import { usePay } from '@reown/appkit-pay/react'

import { useChakraToast } from './Toast'

interface Metadata {
  name: string
  symbol: string
  decimals: number
}

interface AppKitPaymentAsset {
  network: string
  recipient: string
  asset: string
  amount: number
  metadata: Metadata
}

// Define preset keys
type PresetKey = 'NATIVE_BASE' | 'NATIVE_BASE_SEPOLIA' | 'USDC_BASE'

const PRESETS: Record<PresetKey, Omit<AppKitPaymentAsset, 'recipient'>> = {
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
    // Base Sepolia
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
    // USDC on Base
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
  const { open, isLoading, error, result } = usePay()
  const toast = useChakraToast()
  const [paymentDetails, setPaymentDetails] = useState<AppKitPaymentAsset>({
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

  function isPresetActive(preset: Omit<AppKitPaymentAsset, 'recipient'>): boolean {
    return (
      paymentDetails.network === preset.network &&
      paymentDetails.asset === preset.asset &&
      paymentDetails.amount === preset.amount &&
      paymentDetails.metadata.name === preset.metadata.name &&
      paymentDetails.metadata.symbol === preset.metadata.symbol &&
      paymentDetails.metadata.decimals === preset.metadata.decimals
    )
  }

  function handlePresetClick(preset: Omit<AppKitPaymentAsset, 'recipient'>) {
    setPaymentDetails(prev => ({
      ...preset,
      recipient: prev.recipient
    }))
  }

  useEffect(() => {
    if (error) {
      toast({
        title: 'Transaction failed',
        description: error,
        type: 'error'
      })
    }

    if (result) {
      toast({
        title: 'Transaction successful',
        description: result,
        type: 'success'
      })
    }
  }, [error, isLoading, result])

  async function handleOpenPay() {
    if (!paymentDetails.recipient) {
      console.warn('Please enter a recipient address.')

      return
    }
    if (!/^0x[a-fA-F0-9]{40}$/u.test(paymentDetails.recipient)) {
      console.warn('Please enter a valid Ethereum address for the recipient.')

      return
    }

    await open({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      paymentAsset: paymentDetails as any
    })
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    if (name.startsWith('metadata.')) {
      const key = name.split('.')[1] as keyof Metadata
      setPaymentDetails((prev: AppKitPaymentAsset) => ({
        ...prev,
        metadata: { ...prev.metadata, [key]: value }
      }))
    } else {
      setPaymentDetails((prev: AppKitPaymentAsset) => ({
        ...prev,
        [name as keyof Omit<AppKitPaymentAsset, 'metadata'>]: value
      }))
    }
  }

  function handleAmountChange(_valueAsString: string, valueAsNumber: number) {
    setPaymentDetails((prev: AppKitPaymentAsset) => ({
      ...prev,
      amount: isNaN(valueAsNumber) ? 0 : valueAsNumber
    }))
  }

  function handleDecimalsChange(_valueAsString: string, valueAsNumber: number) {
    setPaymentDetails((prev: AppKitPaymentAsset) => ({
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

          {/* Preset Buttons */}
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
                    value={paymentDetails.amount}
                    onChange={handleAmountChange}
                    min={0}
                  >
                    <NumberInputField />
                  </NumberInput>
                  <FormHelperText>Example: 20</FormHelperText>
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
              isLoading
            }
          >
            {isLoading ? <Spinner /> : 'Open Pay'}
          </Button>
        </Stack>
      </CardBody>
    </Card>
  )
}
