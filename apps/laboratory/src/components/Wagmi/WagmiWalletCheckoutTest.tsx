/* eslint-disable no-console */
import { useState } from 'react'
import React from 'react'

import { Button, HStack, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import { type Config } from 'wagmi'

import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

import { type PaymentOption } from '@/src/types/wallet_checkout'
import { ALLOWED_CHAINS, DEFAULT_PAYMENT_OPTIONS } from '@/src/utils/WalletCheckoutUtil'

import { ConfigurePaymentOptions } from '../ConfigurePaymentOptions'
import DonutCheckout from '../DonutCheckout'

const ALLOWED_CHAINIDS = ALLOWED_CHAINS.map(chain => chain.id) as number[]

interface IBaseProps {
  config?: Config
}

export function WagmiWalletCheckoutTest({ config }: IBaseProps) {
  const { chainId } = useAppKitNetwork()
  const { status } = useAppKitAccount({ namespace: 'eip155' })

  // State for payment configuration that can be updated in the configure modal
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>(DEFAULT_PAYMENT_OPTIONS)

  // Create separate disclosures for each mode
  const {
    isOpen: isPurchaseOpen,
    onOpen: onPurchaseOpen,
    onClose: onPurchaseClose
  } = useDisclosure()
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
          label={paymentOptions.length === 0 ? 'Configure payment options first' : ''}
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
