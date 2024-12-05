'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

import { useAppKit } from '@reown/appkit/react'

export function AppKitButtonMobile() {
  const { open } = useAppKit()

  return (
    <div className="fixed bottom-0 p-4 flex md:hidden w-full backdrop-blur-sm bg-background/20 z-50">
      <Button variant="neutral" size="lg" className="w-full flex md:hidden" onClick={() => open()}>
        Launch AppKit
      </Button>
    </div>
  )
}
