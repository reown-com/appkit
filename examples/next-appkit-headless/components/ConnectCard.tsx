'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import type { WalletItem } from '@reown/appkit'
import { type ChainNamespace } from '@reown/appkit/networks'
import { useAppKitWallets } from '@reown/appkit/react'

import { NamespaceSelectionDialog } from '@/components/NamespaceSelectionDialog'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { AllWalletsContent } from './AllWalletsContent'
import { ConnectContent } from './ConnectContent'
import { WalletConnectQRContent } from './WalletConnectQRContent'

export function ConnectCard({ className, ...props }: React.ComponentProps<'div'>) {
  const { connect, wcUri, connectingWallet, isFetchingWcUri, resetWcUri } = useAppKitWallets()

  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null)
  const [showWalletSearch, setShowWalletSearch] = useState(false)
  const [isNamespaceDialogOpen, setIsNamespaceDialogOpen] = useState(false)

  const showQRCode = connectingWallet && !connectingWallet.isInjected

  function onOpenNamespaceDialog(item: WalletItem) {
    setSelectedWallet(item)
    setIsNamespaceDialogOpen(true)
  }

  async function onConnect(item: WalletItem, namespace?: ChainNamespace) {
    setIsNamespaceDialogOpen(false)
    await connect(item, namespace)
      .then(() => {
        setSelectedWallet(null)
        toast.success('Connected wallet')
      })
      .catch(error => {
        console.error(error)
        toast.error('Failed to connect wallet')
      })
  }

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
        onSelect={onConnect}
      />
      <Card
        className={cn(
          'min-h-[600px] w-full h-full gap-0 p-0 overflow-hidden shadow-sm flex-col-reverse md:flex-row',
          { 'flex p-0': showQRCode }
        )}
      >
        <div className={cn('flex-1', showQRCode && 'border-r border-border')}>
          {showWalletSearch ? (
            <AllWalletsContent onBack={() => setShowWalletSearch(false)} onConnect={onConnect} />
          ) : (
            <ConnectContent
              onConnect={onConnect}
              onOpenNamespaceDialog={onOpenNamespaceDialog}
              setShowWalletSearch={setShowWalletSearch}
            />
          )}
        </div>
        {/* Render QR Code on the right side */}
        {showQRCode && (
          <div className="flex-1 p-6 bg-muted/70">
            <WalletConnectQRContent
              connectingWallet={connectingWallet}
              wcUri={wcUri}
              isFetchingWcUri={isFetchingWcUri}
              onClose={resetWcUri}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
