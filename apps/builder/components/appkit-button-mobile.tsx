'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

import { useAppKit } from '@reown/appkit/react'

export function AppKitButtonMobile() {
  const { open } = useAppKit()

  return (
    <div className="relative flex md:hidden w-full">
      {/* @ts-ignore */}
      <w3m-modal />
      <Button variant="neutral" size="lg" className="w-full flex md:hidden" onClick={() => open()}>
        Launch AppKit
      </Button>
    </div>
  )
}
