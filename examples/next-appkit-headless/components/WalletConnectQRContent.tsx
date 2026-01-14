'use client'

import QRCode from 'react-qr-code'

import { CopyIcon, ExternalLinkIcon, Loader2Icon, X } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

import type { WalletItem } from '@reown/appkit'
import { CoreHelperUtil } from '@reown/appkit/react'

import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'

interface WalletConnectQRContentProps {
  connectingWallet: WalletItem | undefined
  wcUri: string | undefined
  isFetchingWcUri: boolean
  onClose: () => void
}

export function WalletConnectQRContent({
  connectingWallet,
  wcUri,
  isFetchingWcUri,
  onClose
}: WalletConnectQRContentProps) {
  function handleCopyUri() {
    if (wcUri) {
      navigator.clipboard.writeText(wcUri)
      toast.success('WalletConnect URI copied to clipboard')
    }
  }

  if (!connectingWallet) {
    return null
  }

  const isMobile = CoreHelperUtil.isMobile()
  const installationLinks = connectingWallet.walletInfo?.installationLinks

  function handleAppStoreClick() {
    if (installationLinks?.appStore) {
      window.open(installationLinks.appStore, '_blank', 'noopener,noreferrer')
    }
  }

  function handlePlayStoreClick() {
    if (installationLinks?.playStore) {
      window.open(installationLinks.playStore, '_blank', 'noopener,noreferrer')
    }
  }

  function handleChromeStoreClick() {
    if (installationLinks?.chromeStore) {
      window.open(installationLinks.chromeStore, '_blank', 'noopener,noreferrer')
    }
  }

  function handleDesktopLinkClick() {
    if (installationLinks?.desktopLink) {
      window.open(installationLinks.desktopLink, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <CardTitle className="text-lg font-semibold w-full">Scan QR Code</CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Wallet Info */}
      <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
        {connectingWallet.imageUrl ? (
          <Image
            src={connectingWallet.imageUrl}
            alt={connectingWallet.name}
            width={40}
            height={40}
            className="rounded-md"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-md bg-muted">
            <span className="text-sm font-bold">{connectingWallet.name.charAt(0)}</span>
          </div>
        )}
        <div className="flex flex-1 flex-col items-start">
          <span className="font-medium">{connectingWallet.name}</span>
          <span className="text-xs text-muted-foreground">Connecting via WalletConnect</span>
        </div>
      </div>

      {/* QR Code */}
      <div className="relative flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyUri}
          className="absolute right-3 top-3"
          disabled={!wcUri}
        >
          <CopyIcon className="size-4" />
          Copy
        </Button>
        {isFetchingWcUri ? (
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        ) : wcUri ? (
          <QRCode
            value={wcUri}
            size={200}
            style={{ height: 'auto', maxWidth: '100%', width: 'auto' }}
            data-testid="qr-code"
          />
        ) : null}
      </div>

      {/* Instructions */}
      <div className="rounded-md p-4 bg-foreground/5">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Connection Instructions:</p>
        <p className="text-xs text-muted-foreground">
          1. Open {connectingWallet.name} on your phone
          <br />
          2. Scan the QR code above
          <br />
          3. Approve the connection request
        </p>
      </div>

      {/* Download Links */}
      {isMobile && installationLinks && (
        <div className="rounded-md p-4 bg-muted/50">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Don&apos;t have the app?</p>
          <div className="flex gap-2 flex-wrap">
            {installationLinks.appStore && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAppStoreClick}
                className="flex-1 min-w-[120px]"
              >
                <ExternalLinkIcon className="size-4" />
                App Store
              </Button>
            )}
            {installationLinks.playStore && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayStoreClick}
                className="flex-1 min-w-[120px]"
              >
                <ExternalLinkIcon className="size-4" />
                Play Store
              </Button>
            )}
            {installationLinks.chromeStore && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleChromeStoreClick}
                className="flex-1 min-w-[120px]"
              >
                <ExternalLinkIcon className="size-4" />
                Chrome Store
              </Button>
            )}
            {installationLinks.desktopLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDesktopLinkClick}
                className="flex-1 min-w-[120px]"
              >
                <ExternalLinkIcon className="size-4" />
                Desktop
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
