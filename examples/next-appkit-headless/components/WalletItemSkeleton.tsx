import { ChevronRightIcon } from 'lucide-react'

import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'

export function WalletItemSkeleton() {
  return (
    <Item variant="outline" className="group" size="sm">
      <ItemMedia className="rounded-sm mr-2 overflow-hidden w-6 h-6">
        <div className="w-6 h-6 rounded-sm bg-muted animate-pulse" />
      </ItemMedia>
      <ItemContent className="flex flex-row items-center justify-between">
        <ItemTitle>
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </ItemTitle>
        <div className="flex flex-row items-center gap-2">
          <div className="flex flex-row items-center gap-2 opacity-0">
            <div className="w-[18px] h-[18px] rounded-full bg-muted animate-pulse" />
          </div>
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4 text-muted-foreground" />
      </ItemActions>
    </Item>
  )
}
