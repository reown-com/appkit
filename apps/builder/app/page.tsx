'use client'

import { useAppKitContext } from '@/hooks/use-appkit'
import { SidebarContent } from '@/components/sidebar-content'
import { PreviewContent } from '@/components/preview-content'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function Page() {
  const { config } = useAppKitContext()

  return (
    <div
      className={cn(
        'flex flex-col overflow-auto items-center md:items-start md:flex-row p-4 bg-background h-screen gap-4 pt-10 md:pt-4',
        config.themeMode === 'dark' ? 'dark' : ''
      )}
    >
      <Image
        src={config.themeMode === 'dark' ? '/reown-logo.png' : '/reown-logo-dark.png'}
        alt="Reown logo"
        width={150}
        height={40}
        className="flex md:hidden mb-2"
      />

      <div className="flex-col gap-2 items-center flex md:hidden">
        <h4 className="text-3xl text-text-primary mb-1 text-center">AppKit demo</h4>
        <p className="text-sm text-text-secondary mb-6 text-center">
          Use our AppKit demo to test and design onchain UX
        </p>
      </div>

      <div className="flex max-w-[450px] md:max-w-[340px] w-full bg-transparent md:bg-fg-primary h-none md:h-full text-foreground p-0 md:p-6 flex-col rounded-2xl overflow-none md:overflow-y-auto">
        <SidebarContent />
      </div>

      <div className="flex-col max-w-[360px] md:max-w-none w-full h-none md:h-full hidden md:flex">
        <PreviewContent />
      </div>
    </div>
  )
}
