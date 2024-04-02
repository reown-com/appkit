import { toast } from 'sonner'
import { useAccount, useWriteContract } from 'wagmi'
import { useCallback, useState } from 'react'
import { optimism, sepolia } from 'wagmi/chains'
import { Button, buttonVariants } from '@/components/ui/button'
import { Span } from '@/components/ui/typography'
import { Column } from '@/components/ui/column'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

export function WagmiSendUSDCTest() {
  const [isLoading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const { status, chain } = useAccount()

  const { writeContract } = useWriteContract({
    mutation: {
      onSuccess: hash => {
        setLoading(false)
        toast.success('Transaction Success', {
          description: hash
        })
      },
      onError: () => {
        setLoading(false)
        toast.error('Error', {
          description: 'Failed to send transaction'
        })
      }
    }
  })

  const onSendTransaction = useCallback(() => {
    setLoading(true)
    writeContract({
      abi: minTokenAbi,
      functionName: 'transfer',
      args: [address, amount],
      address: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238'
    })
  }, [writeContract, address, amount])

  const allowedChains = [sepolia.id, optimism.id] as number[]

  return allowedChains.includes(Number(chain?.id)) && status === 'connected' ? (
    <Column className="sm:flex-row sm:items-center w-full gap-4 justify-between">
      <Input placeholder="0xf34ffa..." onChange={e => setAddress(e.target.value)} value={address} />
      <Input
        placeholder="Units (1000000000 for 1 USDC)"
        onChange={e => setAmount(e.target.value)}
        value={amount}
        type="number"
      />
      <Button
        className="w-4/6"
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={!writeContract}
        aria-disabled={isLoading}
        variant={'default'}
      >
        Send USDC
      </Button>
      <Link
        aria-disabled={isLoading}
        className={cn(buttonVariants({ variant: 'outline' }))}
        target="_blank"
        href="https://faucet.circle.com"
      >
        USDC Faucet
      </Link>
    </Column>
  ) : (
    <Span className="text-red-700 dark:text-red-400">
      Switch to Sepolia or OP to test this feature
    </Span>
  )
}
