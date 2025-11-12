'use client'

import { ChevronRightIcon, Loader2Icon } from 'lucide-react'
import Image from 'next/image'

import type { WalletItem } from '@reown/appkit'
import { useAppKitWallets } from '@reown/appkit/react'

import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { cn } from '@/lib/utils'

type Props = {
  wallet: WalletItem
  connectingWallet: WalletItem | undefined
  onClick?: (wallet: WalletItem) => void
}

export function WalletConnectWalletItem({ connectingWallet, wallet, onClick }: Props) {
  const { isFetchingWcUri } = useAppKitWallets()

  return (
    <Item
      variant="outline"
      size="sm"
      className={cn('cursor-pointer transition-colors hover:bg-accent/50')}
      onClick={() => onClick?.(wallet)}
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
        <ItemContent className="min-w-0 flex-1">
          <ItemTitle className="truncate">{wallet.name}</ItemTitle>
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
