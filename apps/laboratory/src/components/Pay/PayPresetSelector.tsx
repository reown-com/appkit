import { Button, Stack, Text } from '@chakra-ui/react'

import {
  baseETH,
  baseSepoliaETH,
  baseUSDC,
  ethereumUSDC,
  solanaSOL,
  solanaUSDC
} from '@reown/appkit-pay'

export const PAY_PRESETS = [
  { label: 'ETH on Base', asset: baseETH, amount: 0.00001 },
  { label: 'ETH on Base Sepolia', asset: baseSepoliaETH, amount: 0.00001 },
  { label: 'USDC on Base', asset: baseUSDC, amount: 1 },
  { label: 'USDC on Ethereum', asset: ethereumUSDC, amount: 1 },
  { label: 'USDC on Solana', asset: solanaUSDC, amount: 1 },
  { label: 'SOL on Solana', asset: solanaSOL, amount: 0.00001 }
] as const

interface PayPresetSelectorProps {
  selectedPreset: (typeof PAY_PRESETS)[number] | null
  onSelectPreset: (preset: (typeof PAY_PRESETS)[number]) => void
}

export function PayPresetSelector({ selectedPreset, onSelectPreset }: PayPresetSelectorProps) {
  return (
    <Stack spacing="2">
      {PAY_PRESETS.map(preset => {
        const isActive = selectedPreset?.label === preset.label

        return (
          <Button
            key={preset.label}
            onClick={() => onSelectPreset(preset)}
            variant={isActive ? 'solid' : 'outline'}
            colorScheme={isActive ? 'blue' : 'gray'}
            justifyContent="flex-start"
          >
            <Text as="span" fontWeight="medium">
              {preset.label}
            </Text>
            <Text as="span" ml="auto" opacity={0.7}>
              {preset.amount} {preset.asset.metadata.symbol}
            </Text>
          </Button>
        )
      })}
    </Stack>
  )
}
