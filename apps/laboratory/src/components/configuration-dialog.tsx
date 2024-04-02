import * as React from 'react'

import { Column } from '@/components/ui/column'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ThemeStore } from '@/utils/StoreUtil'
import MixColorInput from '@/components/Theming/MixColorInput'
import AccentColorInput from '@/components/Theming/AccentColorInput'
import BorderRadiusInput from '@/components/Theming/BorderRadiusInput'
import { GearIcon } from '@radix-ui/react-icons'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Span } from '@/components/ui/typography'
import { useTheme } from 'next-themes'

export const ConfigurationDialog = () => {
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
          'overflow-hidden !rounded-r-none origin-center max-w-[600px] Row flex-col items-start fixed right-0 top-[50%] left-[100%] w-full h-[100dvh] -translate-y-1/2 -translate-x-full border focus:outline-none',
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
