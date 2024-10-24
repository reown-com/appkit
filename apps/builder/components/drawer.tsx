'use client'

import { useEffect, useState } from 'react'
import { Drawer } from 'vaul'
import { SidebarContent } from './sidebar-content'
import { cn } from '@/lib/utils'
import { useAppKit } from '@/contexts/AppKitContext'

export default function VaulDrawer() {
  const { themeMode, isDrawerOpen, setIsDrawerOpen } = useAppKit()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsDrawerOpen(true)
      } else {
        setIsDrawerOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Drawer.Root modal={false} open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 flex sm:hidden" />
        <Drawer.Content
          className={cn(
            'flex-col bg-muted/40 backdrop-blur-2xl h-[35%] fixed bottom-0 left-0 right-0 outline-none rounded-t-[10px] flex sm:hidden rounded-2xl',
            themeMode === 'dark' ? 'dark' : ''
          )}
        >
          <div className={cn('p-4 h-full overflow-auto', themeMode === 'dark' ? 'dark' : '')}>
            <SidebarContent />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
