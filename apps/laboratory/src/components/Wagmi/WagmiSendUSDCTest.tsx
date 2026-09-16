import { useState } from 'react'
import React from 'react'

import { WarningIcon } from '@chakra-ui/icons'
import {
  Button,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import { erc20Abi, parseUnits } from 'viem'
import { useAccount, useSendTransaction, useWriteContract } from 'wagmi'

import type { Address, Hex } from '@reown/appkit-common'
import { arbitrum, arc, arcTestnet, base, optimism, sepolia } from '@reown/appkit/networks'

import { useChakraToast } from '@/src/components/Toast'
import { useTransactionToast } from '@/src/components/TransactionToast'
import { useWalletGetAssets } from '@/src/hooks/useWalletGetAssets'
import { ErrorUtil } from '@/src/utils/ErrorUtil'

const ALLOWED_CHAINS = [sepolia, optimism, base, arbitrum, arc, arcTestnet]
const ALLOWED_CHAINIDS = ALLOWED_CHAINS.map(chain => chain.id) as number[]

// Arc chains use USDC as native currency (18 decimals)
const NATIVE_USDC_CHAIN_IDS = [arc.id, arcTestnet.id] as number[]

// ERC20 USDC token addresses (6 decimals)
const TOKEN_ADDRESSES: Record<number, Hex> = {
  [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  [optimism.id]: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
}

interface SendUSDCFormProps {
  isOpen: boolean
  onClose: () => void
  balance: string
  isNativeUsdc: boolean
  chainId: number
}

function SendUSDCForm({ isOpen, onClose, balance, isNativeUsdc, chainId }: SendUSDCFormProps) {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const { fetchBalances } = useWalletGetAssets()
  const { showPendingToast, showSuccessToast, showErrorToast } = useTransactionToast()

  // Use wagmi hooks for transactions
  const { sendTransaction, isPending: isSendPending } = useSendTransaction({
    mutation: {
      onSuccess: hash => {
        showSuccessToast(hash)
        fetchBalances()
      },
      onError: error => {
        showErrorToast(ErrorUtil.getErrorMessage(error, 'Failed to send transaction'))
      }
    }
  })

  const { writeContract, isPending: isWritePending } = useWriteContract({
    mutation: {
      onSuccess: hash => {
        showSuccessToast(hash)
        fetchBalances()
      },
      onError: error => {
        showErrorToast(ErrorUtil.getErrorMessage(error, 'Failed to send transaction'))
      }
    }
  })

  const isLoading = isSendPending || isWritePending

  function onSendTransaction() {
    if (!toAddress.startsWith('0x')) {
      showErrorToast('Invalid address format')

      return
    }

    onClose()
    showPendingToast()

    if (isNativeUsdc) {
      // Arc chains: USDC is native currency with 18 decimals
      const usdcAmount = parseUnits(amount, 18)
      sendTransaction({
        to: toAddress as Address,
        value: usdcAmount
      })
    } else {
      // Other chains: USDC is ERC20 token with 6 decimals
      const usdcAmount = parseUnits(amount, 6)
      const contractAddress = TOKEN_ADDRESSES[chainId]
      if (!contractAddress) {
        showErrorToast('USDC contract address not found for this chain')

        return
      }
      writeContract({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [toAddress as Address, usdcAmount],
        address: contractAddress
      })
    }
  }

  const parsedAmount = parseFloat(amount)
  const parsedBalance = parseFloat(balance)
  const hasInsufficientBalance = amount !== '' && parsedAmount > parsedBalance

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send USDC {isNativeUsdc && '(Native)'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {isNativeUsdc && (
              <Text fontSize="sm" color="blue.300">
                On Arc, USDC is the native currency (like ETH on Ethereum)
              </Text>
            )}
            <Text fontSize="md" fontWeight="bold">
              Available Balance: {balance} USDC
            </Text>
            <Input
              placeholder="Destination Address"
              onChange={e => setToAddress(e.target.value)}
              value={toAddress}
            />
            <Input
              placeholder="USDC Amount"
              onChange={e => setAmount(e.target.value)}
              value={amount}
              type="number"
            />
            {hasInsufficientBalance && (
              <Stack direction="row" spacing={1} align="center">
                <WarningIcon color="yellow.500" />
                <Text color="yellow.500" fontSize="sm">
                  The amount entered exceeds your available balance.
                </Text>
              </Stack>
            )}
            <Stack direction="row" spacing={4}>
              <Button
                data-testid="sign-transaction-button"
                onClick={onSendTransaction}
                isDisabled={isLoading || !toAddress || !amount}
                isLoading={isLoading}
                width="full"
              >
                Send USDC
              </Button>
              <Link isExternal href="https://faucet.circle.com">
                <Button variant="outline" colorScheme="blue" isDisabled={isLoading} width="full">
                  USDC Faucet
                </Button>
              </Link>
            </Stack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export function WagmiSendUSDCTest() {
  const { status, chain } = useAccount()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { fetchBalances } = useWalletGetAssets()
  const [usdcBalance, setUsdcBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useChakraToast()

  const isNativeUsdc = NATIVE_USDC_CHAIN_IDS.includes(Number(chain?.id))

  async function handleOpenModal() {
    setIsLoading(true)
    try {
      const balances = await fetchBalances()
      const currentBalance = balances.find(b => b.symbol === 'USDC')?.balance || '0'
      setUsdcBalance(currentBalance)
      onOpen()
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch balances  ${
          error instanceof Error ? error.message : String(error)
        }`,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <>
      <Button onClick={handleOpenModal} isLoading={isLoading}>
        Send USDC {isNativeUsdc && '(Native)'}
      </Button>

      <SendUSDCForm
        isOpen={isOpen}
        onClose={onClose}
        balance={usdcBalance}
        isNativeUsdc={isNativeUsdc}
        chainId={chain.id}
      />
    </>
  )
}
