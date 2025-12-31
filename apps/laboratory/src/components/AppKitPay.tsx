'use client'

import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  Card,
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
  SimpleGrid,
  Stack,
  StackDivider,
  useDisclosure
} from '@chakra-ui/react'

import type { PaymentAsset } from '@reown/appkit-pay'
import { baseETH } from '@reown/appkit-pay'

import { PayExchangesList } from './Pay/PayExchangesList'
import { PayModalTest } from './Pay/PayModalTest'
import { PAY_PRESETS, PayPresetSelector } from './Pay/PayPresetSelector'
import { PayStatusTracker } from './Pay/PayStatusTracker'
import { PayVanillaTest } from './Pay/PayVanillaTest'

interface ActiveStatusCheck {
  exchangeId: string
  sessionId: string
  exchangeName: string
}

export function AppKitPay() {
  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure()

  const [recipient, setRecipient] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('appkitPayRecipient') || ''
    }

    return ''
  })
  const [selectedPreset, setSelectedPreset] = useState<(typeof PAY_PRESETS)[number] | null>(
    () => PAY_PRESETS[0] || null
  )
  const [amount, setAmount] = useState<number>(0.00001)
  const [asset, setAsset] = useState<PaymentAsset>(baseETH)
  const [amountDisplayValue, setAmountDisplayValue] = useState<string>('0.00001')
  const [activeCheck, setActiveCheck] = useState<ActiveStatusCheck | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appkitPayRecipient', recipient)
    }
  }, [recipient])

  function handleSelectPreset(preset: (typeof PAY_PRESETS)[number]) {
    setSelectedPreset(preset)
    setAsset(preset.asset)
    setAmount(preset.amount)
    setAmountDisplayValue(preset.amount.toString())
  }

  function handleAmountChange(valueAsString: string, valueAsNumber: number) {
    setAmountDisplayValue(valueAsString)
    setAmount(isNaN(valueAsNumber) ? 0 : valueAsNumber)
  }

  function handleAssetChange(field: string, value: string | number) {
    setAsset(prev => {
      const newAsset = { ...prev }

      switch (field) {
        case 'network':
          newAsset.network = value as PaymentAsset['network']
          break
        case 'asset':
          newAsset.asset = value as string
          break
        case 'metadata.name':
          newAsset.metadata = { ...newAsset.metadata, name: value as string }
          break
        case 'metadata.symbol':
          newAsset.metadata = { ...newAsset.metadata, symbol: value as string }
          break
        case 'metadata.decimals':
          newAsset.metadata = { ...newAsset.metadata, decimals: value as number }
          break
        default:
          break
      }

      return newAsset
    })
  }

  function handleDecimalsChange(_valueAsString: string, valueAsNumber: number) {
    handleAssetChange('metadata.decimals', isNaN(valueAsNumber) ? 0 : valueAsNumber)
  }

  function handleSessionStart(exchangeId: string, sessionId: string, exchangeName: string) {
    setActiveCheck({ exchangeId, sessionId, exchangeName })
  }

  function handleStopTracking() {
    setActiveCheck(null)
  }

  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">AppKit Pay Test Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Configuration
            </Heading>
            <Stack spacing="3">
              <FormControl isRequired>
                <FormLabel>Recipient Address</FormLabel>
                <Input
                  placeholder="0x..."
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                />
                <FormHelperText>Enter the wallet address to receive payment</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Presets</FormLabel>
                <PayPresetSelector
                  selectedPreset={selectedPreset}
                  onSelectPreset={handleSelectPreset}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Amount</FormLabel>
                <NumberInput value={amountDisplayValue} onChange={handleAmountChange} min={0}>
                  <NumberInputField />
                </NumberInput>
                <FormHelperText>
                  Currently: {amount} {asset.metadata.symbol}
                </FormHelperText>
              </FormControl>

              <Button onClick={onAdvancedToggle} variant="outline">
                {isAdvancedOpen ? 'Hide' : 'Show'} Advanced Configuration
              </Button>

              <Collapse in={isAdvancedOpen} animateOpacity>
                <Box borderWidth="1px" borderRadius="md" p={3} mt={2}>
                  <Stack spacing="3">
                    <FormControl>
                      <FormLabel>Network (CAIP Network ID)</FormLabel>
                      <Input
                        value={asset.network}
                        onChange={e => handleAssetChange('network', e.target.value)}
                        fontFamily="mono"
                      />
                      <FormHelperText>Example: eip155:8453 (Base Mainnet)</FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Asset Address</FormLabel>
                      <Input
                        value={asset.asset}
                        onChange={e => handleAssetChange('asset', e.target.value)}
                        fontFamily="mono"
                      />
                      <FormHelperText>Token contract address or 'native'</FormHelperText>
                    </FormControl>

                    <SimpleGrid columns={3} spacing={2}>
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input
                          value={asset.metadata.name}
                          onChange={e => handleAssetChange('metadata.name', e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Symbol</FormLabel>
                        <Input
                          value={asset.metadata.symbol}
                          onChange={e => handleAssetChange('metadata.symbol', e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Decimals</FormLabel>
                        <NumberInput
                          value={asset.metadata.decimals}
                          onChange={handleDecimalsChange}
                          min={0}
                          precision={0}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>
                  </Stack>
                </Box>
              </Collapse>
            </Stack>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Pay Modal (usePay Hook)
            </Heading>
            <PayModalTest recipient={recipient} amount={amount} asset={asset} />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Pay Promise (Vanilla JS)
            </Heading>
            <PayVanillaTest recipient={recipient} amount={amount} asset={asset} />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Headless Exchanges
            </Heading>
            <PayExchangesList
              recipient={recipient}
              amount={amount}
              asset={asset}
              onSessionStart={handleSessionStart}
              isStatusCheckActive={Boolean(activeCheck)}
            />
          </Box>

          {activeCheck && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Transaction Status
              </Heading>
              <PayStatusTracker
                exchangeId={activeCheck.exchangeId}
                sessionId={activeCheck.sessionId}
                exchangeName={activeCheck.exchangeName}
                onStop={handleStopTracking}
              />
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
