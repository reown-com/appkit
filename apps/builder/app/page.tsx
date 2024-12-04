'use client'

import * as React from 'react'
import { useAppKitContext } from '@/hooks/use-appkit'
import { SidebarContent } from '@/components/sidebar-content'
import { PreviewContent } from '@/components/preview-content'
import { cn } from '@/lib/utils'
import { W3mHeader } from '@reown/appkit-scaffold-ui'

export default function Component() {
  const { themeMode } = useAppKitContext()

  return (
    <div
      className={cn(
        'flex flex-col overflow-auto items-center md:items-start md:flex-row p-4 bg-background h-screen gap-4',
        themeMode === 'dark' ? 'dark' : ''
      )}
    >
      <div className="flex-col items-start gap-2 items-center flex md:hidden">
        <h4 className="text-3xl text-text-primary mb-1 text-center">AppKit demo</h4>
        <p className="text-sm text-text-secondary mb-6 text-center">
          Use our AppKit demo to test and design onchain UX
        </p>
      </div>

      <div className="flex max-w-[360px] md:max-w-[340px] w-full bg-fg-primary h-none md:h-full text-foreground p-6 flex-col rounded-2xl overflow-none md:overflow-y-auto">
        <SidebarContent />
      </div>

      <div className="flex-col max-w-[360px] md:max-w-none w-full h-none md:h-full hidden md:flex">
        <PreviewContent />
      </div>
    </div>
  )
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wui-flex': { children: JSX.Element | JSX.Element[] }
      'wui-card': { children: JSX.Element | JSX.Element[]; role: string; tabindex: string }
      'w3m-header': Partial<W3mHeader>
      'w3m-router': Partial<W3mRouter>
      'w3m-snackbar': Partial<W3mSnackBar>
      'w3m-tooltip': Partial<W3mTooltip>
    }
  }
}
