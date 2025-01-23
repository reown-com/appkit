import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import Big from 'big.js'
import { Address, formatEther } from 'viem'
import { useBalance as useWagmiBalance } from 'wagmi'

export function useBalance(chain: 'ethereum' | 'solana', account: string) {
  const { data: ethereumBalance } = useWagmiBalance({
    address: account as Address,
    query: {
      enabled: chain === 'ethereum'
    }
  })

  const { data: solanaBalance = 0 } = useQuery({
    queryKey: ['balance', account],
    queryFn: async () => {
      const connection = new Connection(clusterApiUrl('mainnet-beta'))
      const wallet = new PublicKey(account)
      const balance = await connection.getBalance(wallet)

      // eslint-disable-next-line new-cap
      return Big(balance).div(LAMPORTS_PER_SOL).toNumber()
    },
    enabled: chain === 'solana'
  })

  return chain === 'ethereum'
    ? formatEther(ethereumBalance?.value ?? BigInt(0))
    : solanaBalance.toString()
}
