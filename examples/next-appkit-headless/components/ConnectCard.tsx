'use client'

import { useEffect, useState } from 'react'

import { toast } from 'sonner'

import type { WalletItem } from '@reown/appkit'
import { type ChainNamespace } from '@reown/appkit/networks'
import { CoreHelperUtil, useAppKitWallets } from '@reown/appkit/react'

import { NamespaceSelectionDialog } from '@/components/NamespaceSelectionDialog'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { AllWalletsContent } from './AllWalletsContent'
import { ConnectContent } from './ConnectContent'
import { WalletConnectQRContent } from './WalletConnectQRContent'

export function ConnectCard({ className, ...props }: React.ComponentProps<'div'>) {
  const {
    connect,
    wcUri,
    connectingWallet,
    resetWcUri,
    deeplinkStatus,
    deeplinkError,
    resetDeeplinkStatus
  } = useAppKitWallets()
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null)
  const [showWalletSearch, setShowWalletSearch] = useState(false)
  const [isNamespaceDialogOpen, setIsNamespaceDialogOpen] = useState(false)
  const isMobile = CoreHelperUtil.isMobile()

  const showQRCode = !isMobile && wcUri && connectingWallet && !connectingWallet.isInjected

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

  useEffect(() => {
    if (deeplinkStatus === 'failed' && deeplinkError === 'timeout') {
      toast.warning('Can’t open wallet. It might not be installed. Install the app or try again.')
      resetDeeplinkStatus()
    }
  }, [deeplinkStatus, deeplinkError, resetDeeplinkStatus])

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
            <WalletConnectQRContent onClose={() => (isMobile ? null : resetWcUri())} />
          </div>
        )}
      </Card>
    </div>
  )
}
