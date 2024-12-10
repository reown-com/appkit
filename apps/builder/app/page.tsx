'use client'

import { SidebarContent } from '@/components/sidebar-content'
import { PreviewContent } from '@/components/preview-content'
import { cn } from '@/lib/utils'
import { BrandingHeader } from '@/components/branding-header'

export default function Page() {
  return (
    <div
      className={cn(
        'flex flex-col-reverse items-center md:items-start md:flex-row p-4 bg-background gap-4 pt-10 md:pt-4 h-full overflow-auto'
      )}
    >
      <div className="flex max-w-[450px] md:max-w-[340px] w-full bg-transparent md:bg-fg-primary h-none md:h-full text-foreground p-0 md:p-6 flex-col rounded-2xl overflow-none md:overflow-y-auto h-auto pb-20">
        <SidebarContent />
      </div>

      <div className="max-w-[360px] md:max-w-none w-full h-none md:h-full flex flex-col">
        <PreviewContent />
      </div>

      <BrandingHeader className="flex md:hidden" />
    </div>
  )
}
