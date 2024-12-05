'use client'

import * as React from 'react'
import { MonitorSmartphone } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppKitContext } from '@/hooks/use-appkit'
import { cn } from '@/lib/utils'
import { AuthFeatures } from './configuration-sections/connect-options'
import { AdvancedFeatures } from './configuration-sections/wallet-features'
import SidebarContentDesign from '@/components/sidebar-content-design'
import Link from 'next/link'
import { useAppKit } from '@reown/appkit/react'
import Image from 'next/image'
import { BookIcon } from '@/components/icon/book'

function AppKitButton() {
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

export function SidebarContent() {
  const { config } = useAppKitContext()
  const { isInitialized } = useAppKitContext()
  const [activeTab, setActiveTab] = React.useState('auth')

  return (
    <div
      className={cn(
        'flex flex-col justify-between min-h-full',
        config.themeMode === 'dark' ? 'dark' : ''
      )}
    >
      <div className="flex flex-col">
        <Image
          src="/reown-logo.png"
          alt="Reown logo"
          width={150}
          height={40}
          className="hidden md:flex mb-12"
        />

        <div className="flex-col items-start hidden md:flex mb-12 gap-2">
          <h4 className="text-3xl text-text-primary">AppKit demo</h4>
          <p className="text-sm text-text-secondary">
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
      </div>

      <div className="flex flex-col items-center w-full gap-2 mt-8">
        <Link
          href="https://docs.reown.com/appkit/overview"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'neutral-secondary', size: 'lg' }),
            'bg-transparent w-full'
          )}
        >
          Read our docs
          <BookIcon />
        </Link>
        <Link
          href="https://cloud.reown.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'neutral', size: 'lg' }),
            'w-full hidden md:flex'
          )}
        >
          Get started
        </Link>
        {isInitialized && <AppKitButton />}
      </div>
    </div>
  )
}
