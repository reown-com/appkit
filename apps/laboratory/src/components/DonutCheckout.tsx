/* eslint-disable no-console */
import { useState } from 'react'
import React from 'react'

import { AddIcon, MinusIcon } from '@chakra-ui/icons'
import {
  Badge,
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
  VStack
} from '@chakra-ui/react'
import type { Config } from 'wagmi'

import { useWalletCheckout } from '@/src/hooks/useWalletCheckout'
import { type CheckoutRequest, type PaymentOption } from '@/src/types/wallet_checkout'

import { useChakraToast } from './Toast'

const DONUT_PRICE = 0.1

const PRODUCT_METADATA = {
  name: 'Donut',
  description: 'Donut with extra chocolate sprinkles on top',
  imageUrl: 'https://ca-demo.reown.com/donut.png',
  price: `$${DONUT_PRICE}`
}

interface DonutCheckoutProps {
  isOpen: boolean
  onClose: () => void
  config: Config
  paymentOptions: PaymentOption[]
}

export default function DonutCheckout({ isOpen, onClose, paymentOptions }: DonutCheckoutProps) {
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
          return payment
        }

        // Parse hex amount and multiply by donut count
        const originalAmount = parseInt(payment.amount, 16)
        const newAmount = (originalAmount * donutCount).toString(16)

        return {
          ...payment,
          amount: `0x${newAmount}`
        }
      })

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
              <Badge
                colorScheme={paymentOptions.length > 0 ? 'green' : 'red'}
                fontSize="0.9em"
                py={1}
                px={2}
                borderRadius="md"
              >
                {paymentOptions.length} {paymentOptions.length === 1 ? 'Option' : 'Options'}{' '}
                Configured
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
