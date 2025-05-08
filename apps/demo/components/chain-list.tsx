'use client'

import { type ChainNamespace } from '@reown/appkit-common'
import { useAppKitAccount } from '@reown/appkit-controllers/react'

import { ExclamationMarkIcon } from '@/components/icon/exclamation-mark'
import { AlertDescription } from '@/components/ui/alert'
import { Alert } from '@/components/ui/alert'
import { useAppKitContext } from '@/hooks/use-appkit'

import { RoundOptionItem } from './ui/round-option-item'

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
  const { caipAddress } = useAppKitAccount()
  const { enabledChains, enableChain, disableChain } = useAppKitContext()

  function handleChainChange(chainId: ChainNamespace) {
    if (enabledChains.includes(chainId)) {
      if (enabledChains.length > 1) {
        disableChain(chainId)
      }
    } else {
      enableChain(chainId, undefined)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {CHAIN_OPTIONS.map(chain => {
          const isLastChainInNamespace =
            enabledChains.includes(chain.id) && enabledChains.length === 1

          return (
            <RoundOptionItem
              key={chain.id}
              dataTestId={`chain-option-${chain.id}`}
              enabled={enabledChains.includes(chain.id)}
              imageSrc={chain.imageSrc}
              onChange={() => handleChainChange(chain.id)}
              name={chain.name}
              disabled={Boolean(caipAddress) || isLastChainInNamespace}
              message={isLastChainInNamespace ? 'Have at least one chain enabled' : ''}
            />
          )
        })}
      </div>
      {caipAddress ? (
        <Alert>
          <div className="flex items-center gap-3">
            <ExclamationMarkIcon />
            <AlertDescription>
              You can only customize chains when your wallet is disconnected.
            </AlertDescription>
          </div>
        </Alert>
      ) : null}
    </div>
  )
}
