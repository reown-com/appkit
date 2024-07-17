import { Button, Stack, Link, Text, Spacer, Input } from '@chakra-ui/react'
import { useAccount, useWriteContract } from 'wagmi'
import { useCallback, useState } from 'react'
import { optimism, sepolia } from 'wagmi/chains'
import { useChakraToast } from '../Toast'

const minTokenAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  }
]

const ALLOWED_CHAINS = [sepolia.id, optimism.id] as number[]

export function WagmiSendUSDCTest() {
  const { status, chain } = useAccount()

  return ALLOWED_CHAINS.includes(Number(chain?.id)) && status === 'connected' ? (
    <AvailableTestContent />
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Sepolia or OP to test this feature
    </Text>
  )
}

function AvailableTestContent() {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const toast = useChakraToast()

  const { writeContract, isPending: isLoading } = useWriteContract({
    mutation: {
      onSuccess: hash => {
        toast({
          title: 'Transaction Success',
          description: hash,
          type: 'success'
        })
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to send transaction',
          type: 'error'
        })
      }
    }
  })

  const onSendTransaction = useCallback(() => {
    writeContract({
      abi: minTokenAbi,
      functionName: 'transfer',
      args: [address, amount],
      address: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238'
    })
  }, [writeContract, address, amount])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Spacer />
      <Input placeholder="0xf34ffa..." onChange={e => setAddress(e.target.value)} value={address} />
      <Input
        placeholder="Units (1000000000 for 1 USDC)"
        onChange={e => setAmount(e.target.value)}
        value={amount}
        type="number"
      />
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={!writeContract}
        isDisabled={isLoading}
        isLoading={isLoading}
        width="80%"
      >
        Send USDC
      </Button>
      <Link isExternal href="https://faucet.circle.com">
        <Button variant="outline" colorScheme="blue" isDisabled={isLoading}>
          USDC Faucet
        </Button>
      </Link>
    </Stack>
  )
}
