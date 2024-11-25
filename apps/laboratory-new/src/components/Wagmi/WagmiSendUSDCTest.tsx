import { Button, Stack, Link, Text, Spacer, Input } from '@chakra-ui/react'
import { useAccount, type Config } from 'wagmi'
import { useState } from 'react'
import { arbitrum, base, optimism, sepolia } from '@reown/appkit-new/networks'
import { useChakraToast } from '../Toast'
import { erc20Abi, type Chain, type Hex } from 'viem'
import { getWalletClient } from 'wagmi/actions'

const ALLOWED_CHAINS = [sepolia, optimism, base, arbitrum]
const ALLOWED_CHAINIDS = ALLOWED_CHAINS.map(chain => chain.id) as number[]
const TOKEN_ADDRESSES = {
  [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as Hex,
  [optimism.id]: '0x0b2c639c533813f4aa9d7837caf62653d097ff85' as Hex,
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Hex,
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Hex
}

interface IBaseProps {
  config?: Config
}

export function WagmiSendUSDCTest({ config }: IBaseProps) {
  const { status, chain } = useAccount()

  return ALLOWED_CHAINIDS.includes(Number(chain?.id)) && status === 'connected' && chain ? (
    <AvailableTestContent chain={chain} config={config} />
  ) : (
    <Text fontSize="md" color="yellow">
      Allowed chains are:{' '}
      {ALLOWED_CHAINS.map(c => (
        <span key={c.name}>{c.name}, </span>
      ))}
    </Text>
  )
}

interface IProps {
  chain: Chain
  config?: Config
}

function AvailableTestContent({ chain, config }: IProps) {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useChakraToast()

  async function onSendTransaction(wagmiConfig: Config) {
    const usdcAmount = BigInt(Number(amount) * 1000000)
    const chainId = chain.id as keyof typeof TOKEN_ADDRESSES
    const contractAddress = TOKEN_ADDRESSES[chainId]
    const client = await getWalletClient(wagmiConfig)

    try {
      setIsLoading(true)

      const hash = await client.writeContract({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [address as Hex, usdcAmount],
        address: contractAddress
      })
      toast({
        title: 'Transaction Success',
        description: hash,
        type: 'success'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send transaction',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!config) {
    return <Text>Config is not available</Text>
  }

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
        onClick={() => {
          onSendTransaction(config)
        }}
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
