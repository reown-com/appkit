'use client'

import * as React from 'react'
import { useAppKit } from '@/contexts/AppKitContext'
import { SidebarContent } from '@/components/sidebar-content'
import { PreviewContent } from '@/components/preview-content'
import { cn } from '@/lib/utils'
import VaulDrawer from '@/components/drawer'

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
    <div className={cn('flex p-4 bg-background h-screen', themeMode === 'dark' ? 'dark' : '')}>
      <VaulDrawer />

      <div className="w-80 bg-muted dark:bg-fg-primary text-foreground p-6 flex-col rounded-2xl hidden sm:flex">
        <SidebarContent />
      </div>

      <div className="flex-grow flex flex-col p-6">
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
