'use client'

import { useEffect, useState } from 'react'

import { toast } from 'sonner'

import type { WalletItem } from '@reown/appkit'
import { type ChainNamespace } from '@reown/appkit/networks'
import { useAppKitWallets } from '@reown/appkit/react'

import { NamespaceSelectionDialog } from '@/components/NamespaceSelectionDialog'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { InjectedWalletsCardContent } from './InjectedWalletsContent'
import { WalletConnectQRContent } from './WalletConnectQRContent'
import { WalletConnectWalletsContent } from './WalletConnectWalletsContent'

export function ConnectCard({ className, ...props }: React.ComponentProps<'div'>) {
  const { data, connect, wcUri, isFetchingWcUri } = useAppKitWallets()
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null)
  const [showWalletSearch, setShowWalletSearch] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState<WalletItem | undefined>(undefined)
  const [isNamespaceDialogOpen, setIsNamespaceDialogOpen] = useState(false)

  const injectedWallets = data.filter(w => w.isInjected)

  function handleOpenNamespaceDialog(item: (typeof injectedWallets)[number]) {
    setSelectedWallet(item)
    setIsNamespaceDialogOpen(true)
  }

  async function handleConnect(item: WalletItem, namespace?: ChainNamespace) {
    setConnectingWallet(item)
    setIsNamespaceDialogOpen(false)
    await connect(item, namespace)
      .then(() => {
        setSelectedWallet(null)
        setConnectingWallet(undefined)
        toast.success('Connected wallet')
      })
      .catch(error => {
        console.error(error)
        setConnectingWallet(undefined)
        toast.error('Failed to connect wallet')
      })
  }

  function handleWalletConnectClick(wallet: WalletItem) {
    handleConnect(wallet)
  }

  function handleQRBack() {
    setConnectingWallet(undefined)
  }

  const showQRCode = wcUri && connectingWallet && !connectingWallet.isInjected && !isFetchingWcUri

  return (
    <div
      className={cn('flex w-full max-w-xl flex-col gap-6 p-6', className, {
        'max-w-4xl': showQRCode && connectingWallet
      })}
    >
      <NamespaceSelectionDialog
        item={selectedWallet}
        open={selectedWallet?.name && isNamespaceDialogOpen ? true : false}
        onOpenChange={setIsNamespaceDialogOpen}
        onSelect={handleConnect}
      />
      <Card
        className={cn('min-h-[600px] w-full h-full gap-0 p-0 overflow-hidden shadow-sm', {
          'flex flex-row p-0': showQRCode
        })}
      >
        <div className={cn('flex-1', showQRCode && 'border-r border-border')}>
          {showWalletSearch ? (
            <WalletConnectWalletsContent
              onBack={() => setShowWalletSearch(false)}
              onWalletClick={handleWalletConnectClick}
            />
          ) : (
            <InjectedWalletsCardContent
              wallets={injectedWallets}
              connectingWallet={connectingWallet}
              handleConnect={handleConnect}
              handleOpenNamespaceDialog={handleOpenNamespaceDialog}
              setShowWalletSearch={setShowWalletSearch}
            />
          )}
        </div>
        {showQRCode && connectingWallet && (
          <div className="flex-1 p-6 bg-muted/70">
            <WalletConnectQRContent wallet={connectingWallet} onBack={handleQRBack} />
          </div>
        )}
      </Card>
    </div>
  )
}
