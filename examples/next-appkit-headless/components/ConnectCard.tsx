'use client'

import { useEffect, useRef, useState } from 'react'

import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import type { WalletItem } from '@reown/appkit'
import type { ChainNamespace } from '@reown/appkit/networks'
import { CoreHelperUtil, useAppKitWallets } from '@reown/appkit/react'

import { NamespaceSelectionDialog } from '@/components/NamespaceSelectionDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { AllWalletsContent } from './AllWalletsContent'
import { ConnectContent } from './ConnectContent'
import { WalletConnectQRContent } from './WalletConnectQRContent'

export function ConnectCard({ className, ...props }: React.ComponentProps<'div'>) {
  const { connect, wcUri, connectingWallet, resetWcUri, wcError } = useAppKitWallets()
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null)
  const [showWalletSearch, setShowWalletSearch] = useState(false)
  const [isNamespaceDialogOpen, setIsNamespaceDialogOpen] = useState(false)
  const previousWcErrorRef = useRef<boolean | undefined>(false)
  const previousConnectingWalletRef = useRef<WalletItem | undefined>(undefined)

  const isMobile = CoreHelperUtil.isMobile()
  // Don't show QR code on mobile - deep linking is used instead
  const showQRCode = !isMobile && wcUri && connectingWallet && !connectingWallet.isInjected
  // Show error if deep link failed on mobile
  const showDeepLinkError = isMobile && wcError && connectingWallet && !connectingWallet.isInjected

  // Show toast when deep link fails
  useEffect(() => {
    // Only show toast when error state changes from false to true
    // and we had a connecting wallet that's now cleared (indicating failure)
    if (
      wcError &&
      !previousWcErrorRef.current &&
      previousConnectingWalletRef.current &&
      !connectingWallet &&
      isMobile
    ) {
      const walletName = previousConnectingWalletRef.current.name
      toast.error(
        `Unable to open ${walletName}. The app may not be installed on your device. Please install it from the App Store or Play Store, or try another wallet.`,
        {
          duration: 5000
        }
      )
    }

    previousWcErrorRef.current = wcError
    previousConnectingWalletRef.current = connectingWallet
  }, [wcError, connectingWallet, isMobile])

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

  function handleDismissError() {
    resetWcUri()
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
          {/* Deep link error message */}
          {showDeepLinkError && (
            <div className="mx-6 mt-6 mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive mb-1">Connection Failed</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Unable to open {connectingWallet?.name}. The app may not be installed on your
                    device. Please install it from the App Store or Play Store, or try another
                    wallet.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDismissError}
                    className="w-full sm:w-auto"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}
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
            <WalletConnectQRContent onClose={resetWcUri} />
          </div>
        )}
      </Card>
    </div>
  )
}
