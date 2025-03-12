/* eslint-disable no-console */
import { useState } from 'react'
import React from 'react'

import {
  Button,
  HStack,
  Text,
  useDisclosure,
  Tooltip
} from '@chakra-ui/react'
import {  encodeFunctionData, erc20Abi } from 'viem'
import { type Config } from 'wagmi'

import { baseSepolia, sepolia } from '@reown/appkit/networks'

import {
  type EvmContractInteraction,
  type PaymentOption
} from '@/src/types/wallet_checkout'

import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { ConfigurePaymentOptions } from '../ConfigurePaymentOptions'
import DonutCheckout from '../DonutCheckout'
import { vitalikEthAddress } from '@/src/utils/DataUtil'

const ALLOWED_CHAINS = [sepolia, baseSepolia]
const ALLOWED_CHAINIDS = ALLOWED_CHAINS.map(chain => chain.id) as number[]

/**
 * Default payment options:
 * First payment option is for direct payment - of 0.1 USDC on baseSepolia to the recipient
 * Second payment option is for direct payment - of 0.1 USDC on sepolia to the recipient
 * Third payment option is for contract payment - of 0.1 USDC on baseSepolia to the recipient
 */
const DEFAULT_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    recipient: `eip155:84532:${vitalikEthAddress}`,
    asset: 'eip155:84532/erc20:0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    amount: '0x186A0' as `0x${string}`
  },
  {
    recipient: `eip155:11155111:${vitalikEthAddress}`,
    asset: 'eip155:11155111/erc20:0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    amount: '0x186A0' as `0x${string}`
  },
  {
    asset: 'eip155:84532/erc20:0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    amount: '0x186A0' as `0x${string}`,
    contractInteraction: {
      type: 'evm-calls',
      data: [
        {
          to: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [vitalikEthAddress as `0x${string}`, BigInt(100000)]
          }),
          value: '0x0'
        }
      ]
    } as EvmContractInteraction
  }
];

interface IBaseProps {
  config?: Config
}

export function WagmiWalletCheckoutTest({ config }: IBaseProps) {
  const { chainId } = useAppKitNetwork()
  const { status } = useAppKitAccount({ namespace: 'eip155' })
  
  // State for payment configuration that can be updated in the configure modal
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>(DEFAULT_PAYMENT_OPTIONS);
  
  // Create separate disclosures for each mode
  const { isOpen: isPurchaseOpen, onOpen: onPurchaseOpen, onClose: onPurchaseClose } = useDisclosure()
  const { isOpen: isConfigOpen, onOpen: onConfigOpen, onClose: onConfigClose } = useDisclosure()

  if (!ALLOWED_CHAINIDS.includes(Number(chainId)) || status !== 'connected' || !chainId) {
    return (
      <Text fontSize="md" color="yellow">
        Allowed chains are:{' '}
        {ALLOWED_CHAINS.map(c => (
          <span key={c.name}>{c.name}, </span>
        ))}
      </Text>
    )
  }

  if (!config) {
    return <Text>Config is not available</Text>
  }

  return (
    <>
      <HStack spacing={4}>
        <Tooltip 
          label={paymentOptions.length === 0 ? "Configure payment options first" : ""}
          isDisabled={paymentOptions.length > 0}
          hasArrow
        >
          <Button 
            onClick={onPurchaseOpen} 
            isDisabled={paymentOptions.length === 0}
            data-testid="purchase-button"
          >
            Purchase Donut
          </Button>
        </Tooltip>
        <Button onClick={onConfigOpen} variant="outline">
          Configure Payment Options ({paymentOptions.length})
        </Button>
      </HStack>

      {isPurchaseOpen && (
        <DonutCheckout 
          isOpen={isPurchaseOpen} 
          onClose={onPurchaseClose} 
          config={config} 
          paymentOptions={paymentOptions}
        />
      )}
      
      {isConfigOpen && (
        <ConfigurePaymentOptions 
          isOpen={isConfigOpen} 
          onClose={onConfigClose} 
          paymentOptions={paymentOptions}
          onPaymentOptionsChange={setPaymentOptions}
        />
      )}
    </>
  )
}
