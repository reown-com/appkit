/* eslint-disable no-console */
import { useState } from 'react'
import React from 'react'

import { AddIcon, MinusIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  HStack,
  Heading,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Stack,
  Text,
  VStack,
  useDisclosure,
  Badge,
  Tooltip
} from '@chakra-ui/react'
import {  encodeFunctionData, erc20Abi } from 'viem'
import { type Config } from 'wagmi'

import { baseSepolia, sepolia } from '@reown/appkit/networks'

import { useWalletCheckout } from '@/src/hooks/useWalletCheckout'
import {
  type CheckoutRequest,
  type EvmContractInteraction,
  type PaymentOption
} from '@/src/types/wallet_checkout'

import { useChakraToast } from '../Toast'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { ConfigurePaymentOptions } from '../ConfigurePaymentOptions'

const ALLOWED_CHAINS = [sepolia, baseSepolia]
const ALLOWED_CHAINIDS = ALLOWED_CHAINS.map(chain => chain.id) as number[]

const DONUT_PRICE = 0.1

interface DonutCheckoutProps {
  isOpen: boolean
  onClose: () => void
  config: Config
  paymentOptions: PaymentOption[]
}

const PRODUCT_METADATA = {
  name: 'Donut',
  description: 'Donut with extra chocolate sprinkles on top',
  imageUrl: 'https://ca-demo.reown.com/donut.png',
  price: `$${DONUT_PRICE}`
}

/**
 * Default payment options:
 * First payment option is for direct payment - of 0.1 USDC on baseSepolia to the recipient
 * Second payment option is for direct payment - of 0.1 USDC on sepolia to the recipient
 * Third payment option is for direct payment - of 0.1 USDC on optimism to the recipient
 * Fourth payment option is for contract payment - of 0.1 USDC on baseSepolia to the recipient
 */
const DEFAULT_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    recipient: 'eip155:84532:0xD39483aE92522cd804CEB9DEA399F62E268297AC',
    asset: 'eip155:84532/erc20:0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    amount: '0x186A0' as `0x${string}`
  },
  {
    recipient: 'eip155:11155111:0xD39483aE92522cd804CEB9DEA399F62E268297AC',
    asset: 'eip155:11155111/erc20:0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    amount: '0x186A0' as `0x${string}`
  },
  {
    recipient: 'eip155:11155420:0xD39483aE92522cd804CEB9DEA399F62E268297AC',
    asset: 'eip155:11155420/erc20:0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
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
            args: ['0xD39483aE92522cd804CEB9DEA399F62E268297AC' as `0x${string}`, BigInt(100000)]
          }),
          value: '0x0'
        }
      ]
    } as EvmContractInteraction
  }
];

function DonutCheckout({ isOpen, onClose, paymentOptions }: DonutCheckoutProps) {
  const [donutCount, setDonutCount] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const { sendWalletCheckout, isWalletCheckoutSupported } = useWalletCheckout()
  const toast = useChakraToast()

  // Calculate total price based on donut count
  const totalAmount = donutCount * DONUT_PRICE

  async function onCheckout() {
    try {
      const orderId = crypto.randomUUID()
      const expiry = Math.floor(Date.now() / 1000) + 60 * 60

      // Adjust all payment options based on donut count
      const adjustedPayments: PaymentOption[] = paymentOptions.map(payment => {
        // Skip if amount is not present (should not happen)
        if (!payment.amount) {
          return payment;
        }
        
        // Parse hex amount and multiply by donut count
        const originalAmount = parseInt(payment.amount, 16);
        const newAmount = (originalAmount * donutCount).toString(16);
        
        return {
          ...payment,
          amount: `0x${newAmount}`
        };
      });

      const walletCheckoutRequest: CheckoutRequest = {
        orderId,
        acceptedPayments: adjustedPayments,
        products: [PRODUCT_METADATA],
        expiry
      }

      setIsLoading(true)
      const result = await sendWalletCheckout(walletCheckoutRequest)

      if (result) {
        toast({
          title: 'Checkout successful',
          description: JSON.stringify(result || {}),
          type: 'success'
        })
        onClose()
      } else {
        toast({
          title: 'Checkout failed',
          description: 'No result from wallet checkout call',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      if (error && typeof error === 'object' && 'message' in error) {
        toast({
          title: 'Checkout failed',
          description: error.message as string,
          type: 'error'
        })
      } else {
        toast({
          title: 'Checkout failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          type: 'error'
        })
      }
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Donut Checkout</ModalHeader>
        <ModalBody>
          <Card direction={'row'} overflow="hidden" variant="outline" alignItems="center">
            <Image
              objectFit="contain"
              w="150px"
              h="150px"
              src="https://ca-demo.reown.com/donut.png"
              alt="Donut Image"
            />

            <Stack w="full">
              <CardBody py={4}>
                <Heading size="md">{PRODUCT_METADATA.name}</Heading>
                <Text py={2} fontSize="sm" color="gray.600">
                  {PRODUCT_METADATA.description}
                </Text>
                <HStack justifyContent={'space-between'} alignItems={'center'}>
                  <Text fontSize={'sm'} fontWeight="semibold">
                    Price: {PRODUCT_METADATA.price}
                  </Text>

                  <Flex
                    alignItems="center"
                    borderRadius={8}
                    borderColor="gray.300"
                    borderWidth={1}
                    display="inline-flex"
                    overflow="hidden"
                  >
                    <IconButton
                      aria-label="Minus"
                      icon={<MinusIcon />}
                      onClick={() => setDonutCount(Math.max(1, donutCount - 1))}
                      size="xs"
                      borderRadius="0"
                      variant="ghost"
                      disabled={donutCount <= 1}
                    />
                    <Box px={2} py={1} textAlign="center" minW="24px">
                      <Text fontWeight="bold">{donutCount}</Text>
                    </Box>
                    <IconButton
                      aria-label="Add"
                      icon={<AddIcon />}
                      onClick={() => setDonutCount(donutCount + 1)}
                      size="xs"
                      borderRadius="0"
                      variant="ghost"
                    />
                  </Flex>
                </HStack>
              </CardBody>
            </Stack>
          </Card>

          <Spacer my={4} />

          <VStack spacing={3} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontWeight="medium">Payment Options</Text>
              <Badge colorScheme={paymentOptions.length > 0 ? "green" : "red"} fontSize="0.9em" py={1} px={2} borderRadius="md">
                {paymentOptions.length} {paymentOptions.length === 1 ? 'Option' : 'Options'} Configured
              </Badge>
            </Flex>
          </VStack>
          
          <Divider my={3} />

          <VStack spacing={3} align="stretch">
            <Flex justify="space-between" align="center">
              <Text>Total</Text>
              <Text fontSize="lg" fontWeight="bold">
                {totalAmount} USDC
              </Text>
            </Flex>
          </VStack>
        </ModalBody>

        <ModalFooter py={2}>
          <Button
            data-testid="checkout-button"
            onClick={onCheckout}
            disabled={isLoading || !isWalletCheckoutSupported || paymentOptions.length === 0}
            isLoading={isLoading}
            width="full"
            size="md"
          >
            {isWalletCheckoutSupported ? 'Checkout' : 'Wallet Checkout Not Supported'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

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
