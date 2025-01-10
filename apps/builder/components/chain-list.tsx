'use client'

import { ConstantsUtil, type ChainNamespace } from '@reown/appkit-common'
import { RoundOptionItem } from './ui/round-option-item'
import { useAppKitContext } from '@/hooks/use-appkit'
import { useAppKitAccount } from '@reown/appkit-core/react'
import { AlertDescription } from '@/components/ui/alert'
import { Alert } from '@/components/ui/alert'
import { ExclamationMarkIcon } from '@/components/icon/exclamation-mark'
import { getImageDeliveryURL, chainImages } from '@/lib/presets'

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
