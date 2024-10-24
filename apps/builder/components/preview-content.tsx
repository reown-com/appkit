'use client'

import * as React from 'react'
import {
  Sun,
  Moon,
  MonitorSmartphone,
  Smartphone,
  RefreshCcw,
  ArrowRightCircle,
  ArrowLeftCircle,
  Share2,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppKit } from '@/contexts/AppKitContext'
import { toast } from 'sonner'

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
        <Tabs defaultValue="desktop">
          <TabsList className="mb-4 bg-muted">
            <TabsTrigger value="desktop">
              <MonitorSmartphone size={16} className="mr-2" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone size={16} className="mr-2" />
              Mobile
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="default"
          size="icon"
          onClick={() => updateThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
        >
          {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>

      <div className="w-[400px] mx-auto flex-grow flex items-center justify-center">
        <wui-flex style={{ width: '100%' }}>
          <wui-card role="alertdialog" aria-modal="true" style={{ width: '100%' }}>
            <w3m-header></w3m-header>
            <w3m-router></w3m-router>
            <w3m-snackbar></w3m-snackbar>
          </wui-card>
        </wui-flex>
        <w3m-tooltip></w3m-tooltip>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <Button variant="default" onClick={handleShare}>
          <Share2 size={16} className="mr-2" />
          Share
        </Button>
        <Button variant="default">
          <RefreshCcw size={16} className="mr-2" />
          Reset
        </Button>
        <Button variant="default" className="flex sm:hidden" onClick={() => setIsDrawerOpen(true)}>
          <Settings size={16} className="mr-2" />
          Settings
        </Button>
        <Button variant="default">
          <ArrowLeftCircle size={16} className="mr-2" />
        </Button>
        <Button variant="default">
          <ArrowRightCircle size={16} className="mr-2" />
        </Button>
      </div>
    </>
  )
}
