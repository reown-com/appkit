'use client'

import * as React from 'react'
import { MonitorSmartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppKit } from '@/hooks/use-appkit'
import { cn } from '@/lib/utils'
import AccentColorInput from './theme/AccentColorInput'
import MixColorInput from './theme/MixColorInput'
import BorderRadiusInput from './theme/BorderRadiusInput'
import { AuthFeatures } from './configuration-sections/connect-options'
import { AdvancedFeatures } from './configuration-sections/wallet-features'

export function SidebarContent() {
  const { themeMode } = useAppKit()
  const [activeTab, setActiveTab] = React.useState('auth')

  return (
    <div className={cn('h-full flex flex-col', themeMode === 'dark' ? 'dark' : '')}>
      <h4 className="text-3xl text-text-primary mb-1">AppKit demo</h4>
      <p className="text-sm text-text-secondary mb-6">
        Use our AppKit demo to test and design onchain UX
      </p>

      <div className="flex flex-col flex-1 min-h-[300px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 w-full">
          <TabsList className="w-full bg-fg-secondary">
            <TabsTrigger className="w-full" value="auth">
              Auth
            </TabsTrigger>
            <TabsTrigger className="w-full" value="features">
              Features
            </TabsTrigger>
            <TabsTrigger className="w-full" value="other">
              Theme
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'auth' && <AuthFeatures />}
        {activeTab === 'features' && <AdvancedFeatures />}
        {activeTab === 'other' && (
          <div className="space-y-6 flex-grow">
            <div className="space-y-4">
              <MixColorInput />
            </div>
            <div className="space-y-4">
              <AccentColorInput />
            </div>
            <div className="space-y-4">
              <BorderRadiusInput />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center w-full gap-2">
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
