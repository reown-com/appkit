'use client'

import { RoundOptionItem } from './ui/round-option-item'
import { useAppKitContext } from '@/hooks/use-appkit'

const CHAIN_OPTIONS = [
  { id: 'evm', name: 'EVM', imageSrc: '/ethereum.png' },
  { id: 'solana', name: 'Solana', imageSrc: '/solana.png' },
  { id: 'bitcoin', name: 'Bitcoin', imageSrc: '/bitcoin.png' }
]

export function ChainList() {
  const { enabledChains, updateEnabledChains } = useAppKitContext()

  const handleToggleChain = (chainId: string) => {
    const newEnabledChains = enabledChains.includes(chainId)
      ? enabledChains.filter(id => id !== chainId)
      : [...enabledChains, chainId]

    updateEnabledChains(newEnabledChains)
  }

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
