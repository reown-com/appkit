'use client'

import * as React from 'react'
import {
  Moon,
  Sun,
  MonitorSmartphone,
  Smartphone,
  RefreshCcw,
  ArrowRightCircle,
  ArrowLeftCircle,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { W3mHeader, W3mRouter, W3mSnackBar, W3mTooltip } from '@reown/appkit-scaffold-ui'
import { useAppKit } from '@/contexts/AppKitContext'
import { cn } from '@/lib/utils'
import { DragHandleDots2Icon } from '@radix-ui/react-icons'
import { Checkbox } from '@/components/ui/checkbox'

// Add this type for social options
type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

export default function Component() {
  const {
    features,
    updateFeatures,
    themeMode,
    updateThemeMode,
    socialsEnabled,
    updateSocials,
    isLoading
  } = useAppKit()

  // Add this function to toggle individual social options
  const toggleSocial = (social: SocialOption) => {
    const currentSocials = Array.isArray(features.socials) ? features.socials : []
    const newSocials = currentSocials.includes(social)
      ? currentSocials.filter(s => s !== social)
      : [...currentSocials, social]

    updateFeatures({ socials: newSocials.length ? newSocials : false })
  }

  console.log('>>> socials', features)

  const toggleFeature = (featureName: 'email' | 'socials' | 'emailShowWallets') => {
    updateFeatures({ [featureName]: !features[featureName] })
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      // You might want to add a toast notification here
      console.log('URL copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className={`flex p-4 bg-background/95 h-screen ${themeMode === 'dark' ? 'dark' : ''}`}>
      <div className="w-80 bg-muted dark:bg-muted/50 text-foreground p-6 flex flex-col rounded-2xl">
        <h1 className="text-2xl font-bold mb-1">AppKit demo</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Use our AppKit demo to test and design onchain UX
        </p>

        <Tabs defaultValue="auth" className="mb-6 w-full">
          <TabsList className="w-full">
            <TabsTrigger className="w-full" value="auth">
              Auth
            </TabsTrigger>
            <TabsTrigger className="w-full" value="features">
              Features
            </TabsTrigger>
            <TabsTrigger className="w-full" value="other">
              Other
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
            <span className="flex items-center gap-2">
              <DragHandleDots2Icon
                className={cn('w-5 h-5', features.email ? 'text-blue-500' : 'text-gray-500')}
              />
              Email
            </span>
            <Checkbox
              className="bg-background data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg border-none"
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
            <span className="flex items-center gap-2">
              <DragHandleDots2Icon
                className={cn(
                  'w-5 h-5',
                  Array.isArray(features.socials) ? 'text-blue-500' : 'text-gray-500'
                )}
              />
              Social
            </span>
            <Checkbox
              className="bg-background data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg border-none"
              checked={Array.isArray(features.socials)}
            />
          </button>
          <div className="grid grid-cols-4 gap-2 items-center">
            {(
              [
                'google',
                'x',
                'discord',
                'farcaster',
                'github',
                'apple',
                'facebook'
              ] as SocialOption[]
            ).map(social => {
              const isEnabled = Array.isArray(features.socials) && features.socials.includes(social)
              return (
                <button
                  key={social}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded-xl place-self-center bg-transparent border',
                    isEnabled
                      ? 'border-blue-500 text-foreground'
                      : 'border-muted-foreground/20 text-muted-foreground'
                  )}
                  onClick={() => toggleSocial(social)}
                >
                  <span>{social === 'x' ? 'X' : social.charAt(0).toUpperCase()}</span>
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
            <span className="flex items-center gap-2">
              <DragHandleDots2Icon
                className={cn(
                  'w-5 h-5',
                  Array.isArray(features.socials) ? 'text-blue-500' : 'text-gray-500'
                )}
              />
              Show wallets
            </span>
            <Checkbox
              className="bg-background data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg border-none"
              checked={features.emailShowWallets}
            />
          </button>
        </div>

        <Button variant="outline" className="mb-4 bg-transparent rounded-xl">
          <MonitorSmartphone size={16} className="mr-2" />
          Read our docs
        </Button>
        <Button className="rounded-xl">Get started</Button>
      </div>

      <div className="flex-grow flex flex-col p-6">
        <div className="flex justify-between mb-6">
          <Tabs defaultValue="desktop">
            <TabsList className="mb-4 bg-muted">
              <TabsTrigger value="desktop">
                <MonitorSmartphone size={16} className="mr-2" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="mobile">
                <Smartphone size={16} className="mr-2" />
                Mobile
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="default"
            size="icon"
            onClick={() => updateThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          >
            {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>

        <div className="w-[400px] mx-auto flex-grow flex items-center justify-center">
          <wui-flex style={{ width: '100%' }}>
            <wui-card role="alertdialog" aria-modal="true" style={{ width: '100%' }}>
              <w3m-header></w3m-header>
              <w3m-router></w3m-router>
              <w3m-snackbar></w3m-snackbar>
            </wui-card>
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <Button variant="default" onClick={handleShare}>
            <Share2 size={16} className="mr-2" />
            Share
          </Button>
          <Button variant="default">
            <RefreshCcw size={16} className="mr-2" />
            Reset
          </Button>
          <Button variant="default">
            <ArrowLeftCircle size={16} className="mr-2" />
          </Button>
          <Button variant="default">
            <ArrowRightCircle size={16} className="mr-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wui-flex': { children: JSX.Element | JSX.Element[] }
      'wui-card': { children: JSX.Element | JSX.Element[]; role: string; tabindex: string }
      'w3m-header': Partial<W3mHeader>
      'w3m-router': Partial<W3mRouter>
      'w3m-snackbar': Partial<W3mSnackBar>
      'w3m-tooltip': Partial<W3mTooltip>
    }
  }
}
