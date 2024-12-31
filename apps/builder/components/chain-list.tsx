'use client'

import { RoundOptionItem } from './ui/round-option-item'
import { useAppKitContext } from '@/hooks/use-appkit'

const CHAIN_OPTIONS = [
  { id: 'evm', name: 'EVM', imageSrc: '/images/chains/evm.svg' },
  { id: 'solana', name: 'Solana', imageSrc: '/images/chains/solana.svg' },
  { id: 'bitcoin', name: 'Bitcoin', imageSrc: '/images/chains/bitcoin.svg' }
]

export function ChainList() {
  const { enabledChains, updateEnabledChains } = useAppKitContext()

  const handleToggleChain = (chainId: string) => {
    const newEnabledChains = enabledChains.includes(chainId)
      ? enabledChains.filter(id => id !== chainId)
      : [...enabledChains, chainId]

    console.log('>>> newEnabledChains: ', newEnabledChains)

    updateEnabledChains(newEnabledChains)
  }

  console.log('>>> enabledChains: ', enabledChains)

  return (
    <div className="flex gap-2">
      {CHAIN_OPTIONS.map(chain => (
        <RoundOptionItem
          key={chain.id}
          enabled={enabledChains.includes(chain.id)}
          imageSrc={chain.imageSrc}
          onChange={() => handleToggleChain(chain.id)}
          name={chain.name}
        />
      ))}
    </div>
  )
}
