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
import { type Chain, erc20Abi } from 'viem'
import { type Config, useAccount } from 'wagmi'
import { getWalletClient } from 'wagmi/actions'

import type { Address, Hex } from '@reown/appkit-common'
import { arbitrum, base, optimism, sepolia } from '@reown/appkit/networks'

import { useChakraToast } from '@/src/components/Toast'
import { useTransactionToast } from '@/src/components/TransactionToast'
import { useWalletGetAssets } from '@/src/hooks/useWalletGetAssets'
import { ErrorUtil } from '@/src/utils/ErrorUtil'

const ALLOWED_CHAINS = [sepolia, optimism, base, arbitrum]
const ALLOWED_CHAINIDS = ALLOWED_CHAINS.map(chain => chain.id) as number[]
const TOKEN_ADDRESSES = {
  [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as Hex,
  [optimism.id]: '0x0b2c639c533813f4aa9d7837caf62653d097ff85' as Hex,
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Hex,
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Hex
}

interface SendUSDCFormProps {
  isOpen: boolean
  onClose: () => void
  chain: Chain
  config: Config
  balance: string
}

function SendUSDCForm({ isOpen, onClose, chain, config, balance }: SendUSDCFormProps) {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { fetchBalances } = useWalletGetAssets()
  const { showPendingToast, showSuccessToast, showErrorToast } = useTransactionToast()

  async function onSendTransaction() {
    const usdcAmount = BigInt(Math.round(parseFloat(amount) * 1_000_000))
    const chainId = chain.id as keyof typeof TOKEN_ADDRESSES
    const contractAddress = TOKEN_ADDRESSES[chainId]
    const client = await getWalletClient(config)

    try {
      setIsLoading(true)

      if (!address.startsWith('0x')) {
        throw new Error('Invalid address format')
      }

      onClose()
      showPendingToast()

      const hash = await client.writeContract({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [address as Address, usdcAmount],
        address: contractAddress
      })

      showSuccessToast(hash)
      await fetchBalances()
    } catch (error) {
      showErrorToast(ErrorUtil.getErrorMessage(error, 'Failed to send transaction'))
      onClose()
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  const parsedAmount = parseFloat(amount)
  const parsedBalance = parseFloat(balance)
  const hasInsufficientBalance = amount !== '' && parsedAmount > parsedBalance

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send USDC</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="md" fontWeight="bold">
              Available Balance: {balance} USDC
            </Text>
            <Input
              placeholder="Destination Address"
              onChange={e => setAddress(e.target.value)}
              value={address}
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
                isDisabled={isLoading || !address || !amount}
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

interface IBaseProps {
  config?: Config
}

export function WagmiSendUSDCTest({ config }: IBaseProps) {
  const { status, chain } = useAccount()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { fetchBalances } = useWalletGetAssets()
  const [usdcBalance, setUsdcBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useChakraToast()

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

  if (!config) {
    return <Text>Config is not available</Text>
  }

  return (
    <>
      <Button onClick={handleOpenModal} isLoading={isLoading}>
        Send USDC
      </Button>

      <SendUSDCForm
        isOpen={isOpen}
        onClose={onClose}
        chain={chain}
        config={config}
        balance={usdcBalance}
      />
    </>
  )
}
