import { ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'

import type { WalletItem } from '@reown/appkit'
import { ChainNamespace } from '@reown/appkit/networks'
import { useAppKitWallets } from '@reown/appkit/react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'

interface NamespaceSelectionDialogProps {
  item: WalletItem | null
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSelect?: (item: WalletItem, namespace: ChainNamespace) => void
}

const CHAIN_NAME_MAP = {
  eip155: 'EVM Networks',
  solana: 'Solana',
  polkadot: 'Polkadot',
  bip122: 'Bitcoin',
  cosmos: 'Cosmos',
  sui: 'Sui',
  stacks: 'Stacks',
  ton: 'TON'
}

export function NamespaceSelectionDialog({
  item,
  trigger,
  open,
  onOpenChange,
  onSelect
}: NamespaceSelectionDialogProps) {
  const { connect } = useAppKitWallets()

  async function handleConnectorClick(namespace: ChainNamespace) {
    if (!item) {
      return
    }

    onSelect?.(item, namespace)
  }

  if (!item) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to {item.name}</DialogTitle>
          <DialogDescription>
            {item.name} supports multiple chains. Select a chain you want to connect to.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {item.connectors.map(connector => (
            <Item
              variant="outline"
              size="sm"
              key={connector.id + connector.chain}
              className="cursor-pointer"
              onClick={() => handleConnectorClick(connector.chain)}
            >
              {connector.chainImageUrl && (
                <ItemMedia className="rounded-md overflow-hidden w-8 h-8">
                  <Image
                    src={connector.chainImageUrl}
                    alt={connector.chain}
                    width={32}
                    height={32}
                  />
                </ItemMedia>
              )}
              <ItemContent>
                <ItemTitle>{CHAIN_NAME_MAP[connector.chain]}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4" />
              </ItemActions>
            </Item>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
