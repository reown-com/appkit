'use client'

import * as React from 'react'
import { Sun, Moon, RefreshCcw, Share2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppKit } from '@/contexts/AppKitContext'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeMode } from '@reown/appkit'

export function PreviewContent() {
  const { themeMode, updateThemeMode, setIsDrawerOpen } = useAppKit()

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
      <div className="flex justify-between mb-6">
        <div />
        <Tabs value={themeMode} onValueChange={value => updateThemeMode(value as ThemeMode)}>
          <TabsList className="bg-fg-secondary ring-4 ring-fg-secondary">
            <TabsTrigger value="dark" className="h-full">
              <Moon size={16} />
            </TabsTrigger>
            <TabsTrigger value="light" className="h-full">
              <Sun size={16} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="w-[400px] mx-auto flex-grow flex items-center justify-center">
        {/* @ts-ignore */}
        <w3m-modal style={{ positive: 'relative' }} embedded={true} class="embedded"></w3m-modal>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <Button variant="neutral-secondary" onClick={handleShare}>
          <Share2 size={16} className="mr-2" />
          Share
        </Button>
        <Button variant="neutral-secondary">
          <RefreshCcw size={16} className="mr-2" />
          Reset
        </Button>
        <Button
          variant="neutral-secondary"
          className="flex sm:hidden"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Settings size={16} className="mr-2" />
          Settings
        </Button>
      </div>
    </>
  )
}
