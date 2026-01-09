'use client'

import Image from 'next/image'

import { useAppKitContext } from '@/hooks/use-appkit'
import { cn } from '@/lib/utils'

export function BrandingHeader({ className }: { className?: string }) {
  const { config } = useAppKitContext()

  return (
    <div className={cn('flex flex-col items-center md:items-start justify-center', className)}>
      <Image
        src={config.themeMode === 'light' ? '/reown-logo-dark.png' : '/reown-logo.png'}
        alt="Reown logo"
        width={150}
        height={40}
        className="mb-4 md:mb-12"
      />

      <div className="flex-col gap-2 items-center md:items-start mb-0 md:mb-12">
        <h4 className="text-3xl text-text-primary text-center md:text-left capitalize">
          Reown Demo
        </h4>
        <p className="text-sm text-text-secondary text-center md:text-left">
          Use our demo to test and design onchain UX
        </p>
      </div>
    </div>
  )
}
