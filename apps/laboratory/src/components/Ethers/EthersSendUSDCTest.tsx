import { useState } from 'react'

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
import { BrowserProvider, Contract, JsonRpcSigner, parseUnits } from 'ethers'

import type { Hex } from '@reown/appkit-common'
import { arbitrum, arc, arcTestnet, base, optimism, sepolia } from '@reown/appkit/networks'
import {
  type Provider,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider
} from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { useTransactionToast } from '@/src/components/TransactionToast'
import { useWalletGetAssets } from '@/src/hooks/useWalletGetAssets'
import { ErrorUtil } from '@/src/utils/ErrorUtil'

const ALLOWED_CHAINS = [sepolia, optimism, base, arbitrum, arc, arcTestnet]
const ALLOWED_CHAIN_IDS = ALLOWED_CHAINS.map(chain => chain.id) as number[]

// Arc chains use USDC as native currency (18 decimals)
const NATIVE_USDC_CHAIN_IDS = [arc.id, arcTestnet.id] as number[]

// ERC20 USDC token addresses (6 decimals)
const TOKEN_ADDRESSES: Record<number, Hex> = {
  [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  [optimism.id]: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
}

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)'
]

interface SendUSDCFormProps {
  isOpen: boolean
  onClose: () => void
  chainId: number
  balance: string
  isNativeUsdc: boolean
  walletProvider: Provider
  address: string
}

function SendUSDCForm({
  isOpen,
  onClose,
  chainId,
  balance,
  isNativeUsdc,
  walletProvider,
  address: userAddress
}: SendUSDCFormProps) {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { fetchBalances } = useWalletGetAssets()
  const { showPendingToast, showSuccessToast, showErrorToast } = useTransactionToast()

  async function onSendTransaction() {
    try {
      setIsLoading(true)

      if (!toAddress.startsWith('0x')) {
        throw new Error('Invalid address format')
      }

      onClose()
      showPendingToast()

      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = new JsonRpcSigner(provider, userAddress)

      let txHash = ''

      if (isNativeUsdc) {
        // Arc chains: USDC is native currency with 18 decimals
        const usdcAmount = parseUnits(amount, 18)
        const tx = await signer.sendTransaction({
          to: toAddress,
          value: usdcAmount
        })
        txHash = tx.hash
      } else {
        // Other chains: USDC is ERC20 token with 6 decimals
        const usdcAmount = parseUnits(amount, 6)
        const contractAddress = TOKEN_ADDRESSES[chainId]
        if (!contractAddress) {
          throw new Error('USDC contract address not found for this chain')
        }
        const contract = new Contract(contractAddress, ERC20_ABI, signer)
        // @ts-expect-error ethers types require bracket notation for contract methods
        const tx = await contract.transfer(toAddress, usdcAmount)
        txHash = tx.hash
      }

      showSuccessToast(txHash as Hex)
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
                data-testid="send-usdc-button"
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

export function EthersSendUSDCTest() {
  const { chainId } = useAppKitNetwork()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider<Provider>('eip155')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { fetchBalances } = useWalletGetAssets()
  const [usdcBalance, setUsdcBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useChakraToast()

  const isNativeUsdc = NATIVE_USDC_CHAIN_IDS.includes(Number(chainId))

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
        description: `Failed to fetch balances: ${
          error instanceof Error ? error.message : String(error)
        }`,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!ALLOWED_CHAIN_IDS.includes(Number(chainId)) || !isConnected || !address || !walletProvider) {
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
        chainId={Number(chainId)}
        balance={usdcBalance}
        isNativeUsdc={isNativeUsdc}
        walletProvider={walletProvider}
        address={address}
      />
    </>
  )
}
