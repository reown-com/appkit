'use client'

import { RefreshCcw, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUrlState } from '@/hooks/use-url-state'
import { useAppKitContext } from '@/hooks/use-appkit'
import Image from 'next/image'

export function PreviewContent() {
  const { saveConfig, isLoading } = useUrlState()
  const { config, isInitialized } = useAppKitContext()

  async function handleShare() {
    try {
      await saveConfig(config)
      toast('Link copied to clipboard')
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  return (
    <>
      <Image
        src="/reown-logo.png"
        alt="Reown logo"
        width={150}
        height={40}
        className="flex md:hidden mb-12"
      />

      <div className="w-full max-w-[400px] py-8 mx-auto flex-grow items-center justify-center hidden md:flex">
        {/* @ts-ignore */}
        <w3m-modal
          style={{ positive: 'relative', width: '100%' }}
          embedded={true}
          class="embedded"
        />
      </div>

      <div className="justify-center gap-2 hidden md:flex">
        <Button disabled={isLoading} variant="neutral-secondary" onClick={handleShare}>
          <Share2 size={16} className="mr-2" />
          Share
        </Button>
        <Button variant="neutral-secondary">
          <RefreshCcw size={16} className="mr-2" />
          Reset
        </Button>
      </div>
    </>
  )
}
