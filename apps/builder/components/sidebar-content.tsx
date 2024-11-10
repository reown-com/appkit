'use client'

import * as React from 'react'
import { DragHandleDots2Icon } from '@radix-ui/react-icons'
import { MonitorSmartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppKit } from '@/contexts/AppKitContext'
import { cn } from '@/lib/utils'
import AccentColorInput from './theme/AccentColorInput'
import MixColorInput from './theme/MixColorInput'
import BorderRadiusInput from './theme/BorderRadiusInput'

type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

export function SidebarContent() {
  const { features, updateFeatures, socialsEnabled, updateSocials, themeMode } = useAppKit()

  const toggleSocial = (social: SocialOption) => {
    const currentSocials = Array.isArray(features.socials) ? features.socials : []
    const newSocials = currentSocials.includes(social)
      ? currentSocials.filter(s => s !== social)
      : [...currentSocials, social]

    updateFeatures({ socials: newSocials.length ? newSocials : false })
  }

  const toggleFeature = (featureName: 'email' | 'socials' | 'emailShowWallets') => {
    updateFeatures({ [featureName]: !features[featureName] })
  }

  const [activeTab, setActiveTab] = React.useState('auth')

  return (
    <div className={cn('h-full flex flex-col', themeMode === 'dark' ? 'dark' : '')}>
      <h1 className="text-2xl font-bold mb-1 text-foreground">AppKit demo</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Use our AppKit demo to test and design onchain UX
      </p>

      <div className="flex flex-col flex-1 min-h-[300px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 w-full">
          <TabsList className="w-full">
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

        {activeTab === 'auth' && (
          <div className="space-y-4 flex-grow">
            <button
              className={cn(
                'flex items-center justify-between rounded-xl p-3 w-full',
                features.email
                  ? 'bg-foreground/5 dark:bg-foreground/5'
                  : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
              )}
              onClick={() => toggleFeature('email')}
            >
              <span className="flex items-center gap-2 text-foreground">
                <DragHandleDots2Icon
                  className={cn('w-5 h-5', features.email ? 'text-blue-500' : 'text-gray-500')}
                />
                Email
              </span>
              <Checkbox
                className="bg-transparent border border-muted-foreground/10 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg"
                checked={features.email}
              />
            </button>
            <button
              className={cn(
                'flex items-center justify-between rounded-xl p-3 w-full',
                Array.isArray(features.socials)
                  ? 'bg-foreground/5 dark:bg-foreground/5'
                  : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
              )}
              onClick={() => updateSocials(!socialsEnabled)}
            >
              <span className="flex items-center gap-2 text-foreground">
                <DragHandleDots2Icon
                  className={cn(
                    'w-5 h-5',
                    Array.isArray(features.socials) ? 'text-blue-500' : 'text-gray-500'
                  )}
                />
                Social
              </span>
              <Checkbox
                className="bg-transparent border border-muted-foreground/10 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg"
                checked={Array.isArray(features.socials)}
              />
            </button>
            <div className="grid grid-cols-4 gap-2 items-center">
              {(
                [
                  'apple',
                  'google',
                  'x',
                  'github',
                  'farcaster',
                  'discord',
                  'facebook'
                ] as SocialOption[]
              ).map(social => {
                const isEnabled =
                  Array.isArray(features.socials) && features.socials.includes(social)
                return (
                  <button
                    key={social}
                    className={cn(
                      'w-10 h-10 flex items-center justify-center rounded-xl place-self-center bg-transparent border p-1',
                      isEnabled
                        ? 'border-blue-500 text-foreground'
                        : 'border-muted-foreground/20 text-muted-foreground'
                    )}
                    onClick={() => toggleSocial(social)}
                  >
                    <wui-logo logo={social}></wui-logo>
                  </button>
                )
              })}
            </div>
            <button
              className={cn(
                'flex items-center justify-between rounded-xl p-3 w-full',
                features.emailShowWallets
                  ? 'bg-foreground/5 dark:bg-foreground/5'
                  : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
              )}
              onClick={() => toggleFeature('emailShowWallets')}
            >
              <span className="flex items-center gap-2 text-foreground">
                <DragHandleDots2Icon
                  className={cn(
                    'w-5 h-5',
                    Array.isArray(features.socials) ? 'text-blue-500' : 'text-gray-500'
                  )}
                />
                Show wallets
              </span>
              <Checkbox
                className="bg-transparent border border-muted-foreground/10 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg"
                checked={features.emailShowWallets}
              />
            </button>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-4 flex-grow">{/* ... existing features content */}</div>
        )}

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
        <Button variant="outline" className="bg-transparent rounded-xl w-full">
          <MonitorSmartphone size={16} className="mr-2" />
          Read our docs
        </Button>
        <Button className="rounded-xl w-full">Get started {`</>`}</Button>
      </div>
    </div>
  )
}
