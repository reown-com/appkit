'use client'

import * as React from 'react'
import { RefreshCcw, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function PreviewContent() {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast('Link copied to clipboard')
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  return (
    <>
      <div className="flex-col items-center gap-2 flex md:hidden pt-8">
        <h4 className="text-[32px] text-text-primary mb-1 text-center">AppKit demo</h4>
        <p className="text-[14px] text-text-secondary mb-6 text-center">
          Use our AppKit demo to test and design onchain UX
        </p>
      </div>

      <div className="w-full max-w-[400px] py-8 mx-auto flex-grow items-center justify-center hidden md:flex">
        {/* @ts-ignore */}
        <w3m-modal
          style={{ positive: 'relative', width: '100%' }}
          embedded={true}
          class="embedded"
        />
      </div>

      <div className="justify-center gap-2 hidden md:flex">
        <Button variant="neutral-secondary" onClick={handleShare}>
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
