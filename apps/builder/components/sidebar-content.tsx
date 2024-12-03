'use client'

import * as React from 'react'
import { MonitorSmartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppKit } from '@/hooks/use-appkit'
import { cn } from '@/lib/utils'
import { AuthFeatures } from './configuration-sections/connect-options'
import { AdvancedFeatures } from './configuration-sections/wallet-features'
import SidebarContentDesign from '@/components/sidebar-content-design'

export function SidebarContent() {
  const { themeMode } = useAppKit()
  const [activeTab, setActiveTab] = React.useState('auth')

  return (
    <div className={cn('flex flex-col', themeMode === 'dark' ? 'dark' : '')}>
      <div className="flex-col items-start gap-2 hidden md:flex">
        <h4 className="text-3xl text-text-primary mb-1">AppKit demo</h4>
        <p className="text-sm text-text-secondary mb-6">
          Use our AppKit demo to test and design onchain UX
        </p>
      </div>

      <div className="flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 w-full">
          <TabsList className="w-full bg-fg-secondary">
            <TabsTrigger className="w-full transition-colors" value="auth">
              Auth
            </TabsTrigger>
            <TabsTrigger className="w-full transition-colors" value="features">
              Features
            </TabsTrigger>
            <TabsTrigger className="w-full transition-colors" value="other">
              Design
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'auth' && <AuthFeatures />}
        {activeTab === 'features' && <AdvancedFeatures />}
        {activeTab === 'other' && <SidebarContentDesign />}
      </div>

      <div className="flex flex-col items-center w-full gap-2 mt-8">
        <Button variant="neutral-secondary" className="bg-transparent rounded-xl w-full">
          <MonitorSmartphone size={16} className="mr-2" />
          Read our docs
        </Button>
        <Button variant="neutral" className="rounded-xl w-full">
          Get started {`</>`}
        </Button>
      </div>
    </div>
  )
}
