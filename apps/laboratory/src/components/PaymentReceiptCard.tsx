import React from 'react'

import { CheckCircleIcon } from '@chakra-ui/icons'
import {
  Box,
  Card,
  CardBody,
  Divider,
  Flex,
  HStack,
  Heading,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text,
  VStack
} from '@chakra-ui/react'

import { baseSepolia, sepolia } from '@reown/appkit/networks'

import { type CheckoutResult, type PaymentOption } from '@/src/types/wallet_checkout'
import { getTokenSymbolFromAsset } from '@/src/utils/WalletCheckoutUtil'

interface PaymentReceiptCardProps {
  result: CheckoutResult
  isOpen: boolean
  onClose: () => void
  paymentOptions?: PaymentOption[]
}

/**
 * Extract chain ID and token address from a CAIP-19 asset identifier
 */
function extractAssetInfo(asset: string): {
  chainId: string
  tokenAddress?: string
  isNative: boolean
} {
  const parts = asset.split('/')
  const chainPart = parts[0]?.split(':') || []
  const chainId = chainPart[1] || ''

  // Check if this is a native asset (slip44:60 is ETH)
  if (parts[1]?.startsWith('slip44:')) {
    return { chainId, isNative: true }
  }

  // For ERC20 tokens
  if (parts[1]?.startsWith('erc20:')) {
    const tokenAddress = parts[1].split(':')[1]

    return { chainId, tokenAddress, isNative: false }
  }

  // Default case
  return { chainId, isNative: !parts[1] }
}

// Helper function to format blockchain explorer URL
function getExplorerUrl(txid: string, asset?: string): string {
  if (!asset) {
    return `https://sepolia.etherscan.io/tx/${txid}`
  }

  const { chainId } = extractAssetInfo(asset)
  const chainIdNum = Number(chainId)

  if (chainIdNum === sepolia.id) {
    return `https://sepolia.etherscan.io/tx/${txid}`
  }

  if (chainIdNum === baseSepolia.id) {
    return `https://sepolia.basescan.org/tx/${txid}`
  }

  // Default to Sepolia explorer
  return `https://sepolia.etherscan.io/tx/${txid}`
}

// Helper to format amounts (converts hex to decimal)
function formatAmount(hexAmount?: string): string {
  if (!hexAmount) {
    return 'N/A'
  }

  try {
    // Remove 0x prefix and convert to decimal
    const decimalValue = parseInt(hexAmount.replace(/^0x/u, ''), 16)

    // Format with 6 decimal places (assuming USDC/standard tokens)
    return (decimalValue / 1000000).toFixed(6)
  } catch (e) {
    return hexAmount
  }
}

export function PaymentReceiptCard({ result, isOpen, onClose }: PaymentReceiptCardProps) {
  const { orderId, txid, recipient, asset, amount } = result
  const explorerUrl = getExplorerUrl(txid, asset)
  const formattedAmount = formatAmount(amount)
  const tokenSymbol = getTokenSymbolFromAsset(asset)

  // Format timestamp
  const timestamp = new Date().toLocaleString()

  // Truncate address for display
  function formatAddress(address?: string): string {
    if (!address) {
      return 'N/A'
    }
    const parts = address.split(':')
    const addr = parts[parts.length - 1]

    if (!addr) {
      return 'N/A'
    }

    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Payment Receipt</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Card variant="outline">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex justify="center">
                  <Box textAlign="center" mb={2}>
                    <CheckCircleIcon w={12} h={12} color="green.500" />
                    <Heading size="md" mt={2}>
                      Payment Successful
                    </Heading>
                    <Text color="gray.500" fontSize="sm" mt={1}>
                      {timestamp}
                    </Text>
                  </Box>
                </Flex>

                <Divider />

                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Order ID</Text>
                    <Text>{orderId.substring(0, 8)}...</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="medium">Amount</Text>
                    <HStack>
                      <Text>{formattedAmount}</Text>
                      <Tag size="sm" colorScheme="blue">
                        {tokenSymbol}
                      </Tag>
                    </HStack>
                  </HStack>

                  {recipient && (
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Recipient</Text>
                      <Text fontFamily="mono">{formatAddress(recipient)}</Text>
                    </HStack>
                  )}

                  <HStack justify="space-between">
                    <Text fontWeight="medium">Transaction</Text>
                    <Link href={explorerUrl} isExternal color="blue.500" fontFamily="mono">
                      {txid.substring(0, 6)}...{txid.substring(txid.length - 4)}
                    </Link>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
