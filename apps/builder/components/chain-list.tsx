'use client'

import type { ChainNamespace } from '@reown/appkit-common'
import { RoundOptionItem } from './ui/round-option-item'
import { useAppKitContext } from '@/hooks/use-appkit'

const CHAIN_OPTIONS = [
  { id: 'eip155', name: 'EVM', imageSrc: '/ethereum.png' },
  { id: 'solana', name: 'Solana', imageSrc: '/solana.png' },
  { id: 'bip122', name: 'Bitcoin', imageSrc: '/bitcoin.png' }
] as {
  id: ChainNamespace
  name: string
  imageSrc: string
}[]

export function ChainList() {
  const { enabledChains, removeChain, addChain } = useAppKitContext()

  return (
    <div className="flex gap-2">
      {CHAIN_OPTIONS.map(chain => (
        <RoundOptionItem
          key={chain.id}
          enabled={enabledChains.includes(chain.id)}
          imageSrc={chain.imageSrc}
          onChange={() => {
            if (enabledChains.includes(chain.id)) {
              removeChain(chain.id)
            } else {
              addChain(chain.id)
            }
          }}
          name={chain.name}
        />
      ))}
    </div>
  )
}
