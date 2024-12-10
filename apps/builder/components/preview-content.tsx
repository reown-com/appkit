'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
import { Link1Icon, ResetIcon } from '@radix-ui/react-icons'
import { useAppKitContext } from '@/hooks/use-appkit'

export function PreviewContent() {
  const { isInitialized, resetConfigs } = useAppKitContext()

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast('Link copied to clipboard')
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  return (
    <>
      <div className="w-full max-w-[400px] py-8 mx-auto flex-grow items-center justify-center flex-1 flex items-center justify-center">
        {isInitialized ? (
          <>
            {/* @ts-ignore */}
            <w3m-modal
              style={{ positive: 'relative', width: '100%' }}
              enableEmbedded={true}
              class="embedded"
            />
          </>
        ) : null}
      </div>

      <div className="justify-center gap-2 hidden md:flex">
        <Button variant="neutral-secondary" onClick={handleShare}>
          <Link1Icon width={16} height={16} className="mr-2" />
          Share
        </Button>
        <Button variant="neutral-secondary" onClick={resetConfigs}>
          <ResetIcon width={16} height={16} className="mr-2" />
          Reset
        </Button>
      </div>
    </>
  )
}
