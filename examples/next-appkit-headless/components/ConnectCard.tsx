'use client'

import { useState } from 'react'

import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import type { WalletItem } from '@reown/appkit'
import { type ChainNamespace } from '@reown/appkit/networks'
import { CoreHelperUtil, useAppKitWallets } from '@reown/appkit/react'

import { NamespaceSelectionDialog } from '@/components/NamespaceSelectionDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { AllWalletsContent } from './AllWalletsContent'
import { ConnectContent } from './ConnectContent'
import { WalletConnectQRContent } from './WalletConnectQRContent'

interface MobileSelectedWallet {
  wallet: WalletItem
  namespace?: ChainNamespace
}

export function ConnectCard({ className, ...props }: React.ComponentProps<'div'>) {
  const { connect, wcUri, connectingWallet, isFetchingWcUri, resetWcUri, getWcUri } =
    useAppKitWallets()
  const isMobile = CoreHelperUtil.isMobile()

  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null)
  const [mobileSelectedWallet, setMobileSelectedWallet] = useState<MobileSelectedWallet | null>(
    null
  )
  const [showWalletSearch, setShowWalletSearch] = useState(false)
  const [isNamespaceDialogOpen, setIsNamespaceDialogOpen] = useState(false)

  const showQRCode = connectingWallet && !connectingWallet.isInjected
  const showMobileOpenButton =
    isMobile && mobileSelectedWallet && !mobileSelectedWallet.wallet.isInjected

  function onOpenNamespaceDialog(item: WalletItem) {
    setSelectedWallet(item)
    setIsNamespaceDialogOpen(true)
  }

  /**
   * Handle wallet selection. On mobile for non-injected wallets, triggers two-step flow.
   */
  async function handleWalletSelect(item: WalletItem, namespace?: ChainNamespace) {
    // For injected wallets or desktop, connect directly
    if (item.isInjected || !isMobile) {
      await onConnect(item, namespace)

      return
    }

    // Mobile non-injected wallet: two-step flow
    setMobileSelectedWallet({ wallet: item, namespace })
    // Start prefetching WC URI
    getWcUri()
  }

  async function onConnect(item: WalletItem, namespace?: ChainNamespace) {
    setIsNamespaceDialogOpen(false)
    await connect(item, namespace)
      .then(() => {
        setSelectedWallet(null)
        setMobileSelectedWallet(null)
        toast.success('Connected wallet')
      })
      .catch(error => {
        console.error(error)
        toast.error('Failed to connect wallet')
      })
  }

  function handleMobileOpen() {
    if (mobileSelectedWallet) {
      onConnect(mobileSelectedWallet.wallet, mobileSelectedWallet.namespace)
    }
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
        <div className={cn('flex-1 flex flex-col', showQRCode && 'border-r border-border')}>
          <div className="flex-1">
            {showWalletSearch ? (
              <AllWalletsContent
                onBack={() => setShowWalletSearch(false)}
                onConnect={handleWalletSelect}
                selectedWalletId={mobileSelectedWallet?.wallet.id}
              />
            ) : (
              <ConnectContent
                onConnect={handleWalletSelect}
                onOpenNamespaceDialog={onOpenNamespaceDialog}
                setShowWalletSearch={setShowWalletSearch}
                selectedWalletId={mobileSelectedWallet?.wallet.id}
              />
            )}
          </div>

          {/* Mobile Open Button */}
          {showMobileOpenButton && (
            <div className="border-t border-border p-4">
              <Button
                className="w-full"
                size="lg"
                onClick={handleMobileOpen}
                disabled={isFetchingWcUri || !wcUri}
              >
                {isFetchingWcUri ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  `Open ${mobileSelectedWallet.wallet.name}`
                )}
              </Button>
            </div>
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
