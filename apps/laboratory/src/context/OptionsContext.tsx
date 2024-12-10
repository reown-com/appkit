/**
 * Context to save all the configuration of the application
 */

import type { AppKitOptions } from '@reown/appkit'
import { createContext, useContext, useState } from 'react'
import { ConstantsUtil } from '../utils/ConstantsUtil'

export type AppKitConfig = {
  options: AppKitOptions
  updateOptions: (options: AppKitOptions) => void
}

export const OptionsContext = createContext<AppKitConfig | undefined>(undefined)

export function OptionsProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<AppKitOptions>({
    // Only show this config if email or social login is enabled
    showWallets: true,
    allowUnsupportedChain: false,
    networks: ConstantsUtil.EvmNetworks,
    defaultNetwork: ConstantsUtil.EvmNetworks[0],
    metadata: {
      name: 'Test App',
      description: 'Test App Description',
      url: 'https://test-app.com',
      icons: ['https://test-app.com/icon.png']
    },
    allWallets: 'SHOW',
    projectId: process.env['NEXT_PUBLIC_PROJECT_ID'] as string,
    featuredWalletIds: [],
    includeWalletIds: [],
    excludeWalletIds: [],
    customWallets: [],
    termsConditionsUrl: undefined,
    privacyPolicyUrl: undefined,
    enableWallets: true,
    enableEIP6963: false,
    enableCoinbase: true,
    enableInjected: true,
    enableWalletConnect: true,
    debug: true,
    features: {
      swaps: true,
      onramp: true,
      email: true,
      socials: ['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook'],
      history: true,
      analytics: true,
      allWallets: true
    },
    // These two should be boolean configurations. If true, map to their configs when true
    siwx: undefined,
    siweConfig: undefined
  })

  function updateOptions(newOptions: Partial<AppKitOptions>) {
    setOptions(prev => ({ ...prev, ...newOptions }))
  }

  return (
    <OptionsContext.Provider value={{ updateOptions, options }}>{children}</OptionsContext.Provider>
  )
}

export function useOptions() {
  const context = useContext(OptionsContext)
  if (!context) {
    throw new Error('useOptions must be used within an OptionsProvider')
  }

  return context
}
