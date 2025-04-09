'use client'

import * as React from 'react'

import Link from 'next/link'

import { BrandingHeader } from '@/components/branding-header'
import { SectionConnectOptions } from '@/components/configuration-sections/section-connect-options'
import { SectionDesign } from '@/components/configuration-sections/section-design'
import { SectionWalletFeatures } from '@/components/configuration-sections/section-wallet-features'
import { BookIcon } from '@/components/icon/book'
import { buttonVariants } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export function SidebarContent() {
  const [activeTab, setActiveTab] = React.useState('auth')

  return (
    <div className={cn('flex flex-col justify-between min-h-full')}>
      <div className="flex flex-col">
        <BrandingHeader className="hidden md:flex" />

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

          {activeTab === 'auth' && <SectionConnectOptions />}
          {activeTab === 'features' && <SectionWalletFeatures />}
          {activeTab === 'other' && <SectionDesign />}
        </div>
      </div>

      <div className="flex flex-col items-center w-full gap-2 mt-8 pb-2">
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
          className={cn(buttonVariants({ variant: 'neutral', size: 'lg' }), 'w-full')}
        >
          Get started
        </Link>
      </div>
    </div>
  )
}
