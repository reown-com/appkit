'use client'

import { ChevronRightIcon, Loader2Icon } from 'lucide-react'
import Image from 'next/image'

import type { WalletItem } from '@reown/appkit'
import { useAppKitWallets } from '@reown/appkit/react'

import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { cn } from '@/lib/utils'

import { Badge } from './ui/badge'

type Props = {
  wallet: WalletItem
  connectingWallet: WalletItem | undefined
  onClick: (wallet: WalletItem) => void
}

export function WalletListItem({ connectingWallet, wallet, onClick }: Props) {
  const { isFetchingWcUri } = useAppKitWallets()

  return (
    <Item
      variant="outline"
      size="sm"
      className={cn('cursor-pointer transition-colors hover:bg-accent/50 group')}
      onClick={() => onClick(wallet)}
    >
      <div className="flex w-full items-center">
        <ItemMedia className="mr-2 size-6 shrink-0 overflow-hidden rounded-sm">
          <Image
            src={wallet.imageUrl}
            alt={wallet.name}
            width={24}
            height={24}
            className="size-full object-cover"
          />
        </ItemMedia>
        <ItemContent className="flex flex-row items-center justify-between">
          <ItemTitle>{wallet.name}</ItemTitle>
          {wallet.isInjected ? (
            <div className="flex flex-row items-center gap-2">
              <div className="relative flex flex-row items-center gap-2 group-hover:opacity-100 opacity-0 transition-opacity duration-100">
                {wallet.connectors.map((connector, index) => (
                  <Image
                    key={connector.chain}
                    src={connector.chainImageUrl || ''}
                    alt={'Chain Image for ' + connector.chain}
                    width={18}
                    height={18}
                    className="rounded-full shadow-sm outline outline-muted/70"
                    style={{
                      zIndex: wallet.connectors.length * 2 - index,
                      marginLeft: index > 0 ? '-14px' : 0
                    }}
                  />
                ))}
              </div>
              <Badge variant="outline">Installed</Badge>
            </div>
          ) : null}
        </ItemContent>
        <ItemActions>
          {isFetchingWcUri && connectingWallet?.id === wallet.id ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <ChevronRightIcon className="size-4" />
          )}
        </ItemActions>
      </div>
    </Item>
  )
}
