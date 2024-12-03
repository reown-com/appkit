'use client'

import * as React from 'react'
import { useAppKit } from '@/hooks/use-appkit'
import { SidebarContent } from '@/components/sidebar-content'
import { PreviewContent } from '@/components/preview-content'
import { cn } from '@/lib/utils'
import { W3mHeader } from '@reown/appkit-scaffold-ui'

export default function Component() {
  const { isLoading, themeMode } = useAppKit()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col-reverse overflow-auto items-center md:items-start md:flex-row p-4 bg-background h-screen gap-8',
        themeMode === 'dark' ? 'dark' : ''
      )}
    >
      <div className="flex max-w-[360px] md:max-w-[340px] w-full bg-fg-primary h-none md:h-full text-foreground p-6 flex-col rounded-2xl">
        <SidebarContent />
      </div>

      <div className="flex-grow flex flex-col max-w-[360px] md:max-w-none w-full h-none md:h-full">
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
