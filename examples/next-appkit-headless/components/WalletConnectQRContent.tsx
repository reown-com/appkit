'use client'

import QRCode from 'react-qr-code'

import { CopyIcon, Loader2Icon, X } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

import { useAppKitWallets } from '@reown/appkit/react'

import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'

export function WalletConnectQRContent({ onClose }: { onClose: () => void }) {
  const { connectingWallet, wcUri, isFetchingWcUri } = useAppKitWallets()

  function handleCopyUri() {
    if (wcUri) {
      navigator.clipboard.writeText(wcUri)
      toast.success('WalletConnect URI copied to clipboard')
    }
  }

  if (!connectingWallet) {
    return null
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
    </div>
  )
}
