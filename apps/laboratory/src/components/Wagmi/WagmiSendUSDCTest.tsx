import { Button, Stack, Link, Text, Spacer, Input } from '@chakra-ui/react'
import { useAccount, useWriteContract } from 'wagmi'
import { useCallback, useState } from 'react'
import { arbitrum, base, optimism, sepolia } from 'wagmi/chains'
import { useChakraToast } from '../Toast'
import { erc20Abi, type Chain, type Hex } from 'viem'

const ALLOWED_CHAINS = [sepolia, optimism, base, arbitrum]
const ALLOWED_CHAINIDS = ALLOWED_CHAINS.map(chain => chain.id) as number[]
const TOKEN_ADDRESSES = {
  [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as Hex,
  [optimism.id]: '0x0b2c639c533813f4aa9d7837caf62653d097ff85' as Hex,
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Hex,
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Hex
}

export function WagmiSendUSDCTest() {
  const { status, chain } = useAccount()

  return ALLOWED_CHAINIDS.includes(Number(chain?.id)) && status === 'connected' && chain ? (
    <AvailableTestContent chain={chain} />
  ) : (
    <Text fontSize="md" color="yellow">
      Allowed chains are:{' '}
      {ALLOWED_CHAINS.map(c => (
        <>{c.name}, </>
      ))}
    </Text>
  )
}

interface IProps {
  chain: Chain
}

function AvailableTestContent({ chain }: IProps) {
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
    const usdcAmount = BigInt(Number(amount) * 1000000)
    const chainId = chain.id as keyof typeof TOKEN_ADDRESSES
    const contractAddress = TOKEN_ADDRESSES[chainId]
    writeContract({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [address as Hex, usdcAmount],
      address: contractAddress
    })
  }, [writeContract, address, amount, chain])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Spacer />
      <Input placeholder="Destination" onChange={e => setAddress(e.target.value)} value={address} />
      <Input
        placeholder="USDC Amount"
        onChange={e => setAmount(e.target.value)}
        value={amount}
        type="number"
      />
      <Button
        data-testid="sign-transaction-button"
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
