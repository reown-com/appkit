'use client'

import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import { useAppKitAccount } from '@reown/appkit-core/react'

import { ExclamationMarkIcon } from '@/components/icon/exclamation-mark'
import { AlertDescription } from '@/components/ui/alert'
import { Alert } from '@/components/ui/alert'
import { useAppKitContext } from '@/hooks/use-appkit'
import { chainImages, getImageDeliveryURL } from '@/lib/presets'

import { RoundOptionItem } from './ui/round-option-item'

const CHAIN_OPTIONS = [{ id: 'eip155' }, { id: 'solana' }, { id: 'bip122' }] as {
  id: ChainNamespace
}[]

export function ChainList() {
  const { caipAddress } = useAppKitAccount()
  const { enabledChains, removeChain, addChain } = useAppKitContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {CHAIN_OPTIONS.map(chain => (
          <RoundOptionItem
            key={chain.id}
            enabled={enabledChains.includes(chain.id)}
            disabled={
              Boolean(caipAddress) ||
              (enabledChains.includes(chain.id) && enabledChains.length === 1)
            }
            imageSrc={getImageDeliveryURL(chainImages[chain.id as keyof typeof chainImages])}
            onChange={() => {
              if (enabledChains.includes(chain.id)) {
                if (enabledChains.length > 1) {
                  removeChain(chain.id)
                }
              } else {
                addChain(chain.id)
              }
            }}
            name={ConstantsUtil.CHAIN_NAME_MAP[chain.id]}
          />
        ))}
      </div>
      {caipAddress ? (
        <Alert>
          <div className="flex items-center gap-3">
            <ExclamationMarkIcon />
            <AlertDescription>Customizing the chains available when disconnected</AlertDescription>
          </div>
        </Alert>
      ) : null}
    </div>
  )
}
