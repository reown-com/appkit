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
  useDisclosure
} from '@chakra-ui/react'
import { type Chain, encodeFunctionData, erc20Abi } from 'viem'
import { type Config, useAccount } from 'wagmi'

import { arbitrum, base, optimism, sepolia } from '@reown/appkit/networks'

import { useWalletCheckout } from '@/src/hooks/useWalletCheckout'
import {
  type CheckoutRequest,
  type EvmContractInteraction,
  type PaymentOption
} from '@/src/types/wallet_checkout'

import { useChakraToast } from '../Toast'

const ALLOWED_CHAINS = [sepolia, optimism, base, arbitrum]
const ALLOWED_CHAINIDS = ALLOWED_CHAINS.map(chain => chain.id) as number[]

const DONUT_PRICE = 0.1

interface PurchaseDonutFormProps {
  isOpen: boolean
  onClose: () => void
  chain: Chain
  config: Config
}

const PRODUCT_METADATA = {
  name: 'Donut',
  description: 'Donut with extra chocolate sprinkles on top',
  imageUrl: 'https://ca-demo.reown.com/donut.png',
  price: `$${DONUT_PRICE}`
}

/**
 * First payment option is for direct payment - of 0.1 USDC to the recipient
 * Second payment option is for contract payment - of 0.1 USDC
 */
const ACCEPTED_PAYMENTS: PaymentOption[] = [
  {
    recipient: 'eip155:8453:0xD39483aE92522cd804CEB9DEA399F62E268297AC',
    asset: 'eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    amount: '0x186A0'
  },
  {
    recipient: 'eip155:10:0xD39483aE92522cd804CEB9DEA399F62E268297AC',
    asset: 'eip155:10/erc20:0x0b2c639c533813f4aa9d7837caf62653d097ff85',
    amount: '0x186A0'
  },
  {
    recipient: 'eip155:10:0xD39483aE92522cd804CEB9DEA399F62E268297AC',
    asset: 'eip155:10/slip44:60',
    amount: '0x28ED6103D000'
  },
  {
    asset: 'eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    amount: '0x186A0',
    contractInteraction: {
      type: 'evm-calls',
      data: [
        {
          to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: ['0xD39483aE92522cd804CEB9DEA399F62E268297AC', BigInt(100000)]
          }),
          value: '0x0'
        }
      ]
    } as EvmContractInteraction
  }
]

function PurchaseDonutForm({ isOpen, onClose }: PurchaseDonutFormProps) {
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

      // Adjust payments based on donut count
      const adjustedPayments: PaymentOption[] = ACCEPTED_PAYMENTS.map(payment => {
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

          <Spacer my={2} />

          <VStack spacing={3} align="stretch">
            <Flex justify="space-between" align="center">
              <Text>Accepted Payments</Text>
            </Flex>

            <Flex justify="space-between" align="center">
              <Text>Total</Text>
              <Text fontSize="lg" fontWeight="bold">
                {totalAmount} USDC
              </Text>
            </Flex>
          </VStack>

          <Divider my={2} />
        </ModalBody>

        <ModalFooter py={2}>
          <Button
            data-testid="checkout-button"
            onClick={onCheckout}
            disabled={isLoading || !isWalletCheckoutSupported}
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
  const { status, chain } = useAccount()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { isOpen, onOpen, onClose } = useDisclosure()

  if (!ALLOWED_CHAINIDS.includes(Number(chain?.id)) || status !== 'connected' || !chain) {
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
      <Button onClick={onOpen}>Purchase Donut</Button>

      <PurchaseDonutForm isOpen={isOpen} onClose={onClose} chain={chain} config={config} />
    </>
  )
}
