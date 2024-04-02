import * as React from 'react'

import { Column } from '@/components/ui/column'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ThemeStore } from '@/utils/StoreUtil'
import { GearIcon } from '@radix-ui/react-icons'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { buttonVariants } from '@/components/ui/button'
import { Span } from '@/components/ui/typography'
import { useTheme } from 'next-themes'

import MixColorInput from './MixColorInput'
import AccentColorInput from './AccentColorInput'
import BorderRadiusInput from './BorderRadiusInput'

export function ConfigurationDialog() {
  const { theme } = useTheme()

  React.useEffect(() => {
    if (ThemeStore.state.modal) {
      ThemeStore.state.modal.setThemeMode(theme)
    }
  }, [theme])

  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }))}>
        <GearIcon className="mr-0 sm:mr-2" />
        <Span className="hidden sm:inline-block">Configure</Span>
      </DialogTrigger>
      <DialogContent
        className={cn(
          'flex flex-col items-start',
          'max-w-[600px] w-full h-[100dvh]',
          'fixed right-0 top-[50%] left-[100%] -translate-y-1/2 -translate-x-full origin-center',
          'border focus:outline-none',
          'overflow-hidden !rounded-r-none',
          'data-[state=closed]:!slide-out-to-top-[50%] data-[state=open]:!slide-in-from-top-[50%] data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100'
        )}
      >
        <Column className="p-4 !pt-14 w-full">
          <Column className="gap-4">
            <MixColorInput />
            <AccentColorInput />
            <BorderRadiusInput />
          </Column>
        </Column>
      </DialogContent>
    </Dialog>
  )
}
