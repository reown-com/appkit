'use client'

import { createContext } from 'react'

import { UniqueIdentifier } from '@dnd-kit/core'

import type { ChainNamespace } from '@reown/appkit-common'
import type { Features, SocialProvider, ThemeMode } from '@reown/appkit-core'

import { URLState } from '@/lib/url-state'

interface AppKitContextType {
  config: URLState
  enableWallets: boolean
  socialsEnabled: boolean
  isDraggingByKey: Record<string, boolean>
  enabledChains: ChainNamespace[]
  removeChain: (chain: ChainNamespace) => void
  addChain: (chain: ChainNamespace) => void
  updateThemeMode: (mode: ThemeMode) => void
  updateFeatures: (features: Partial<Features>) => void
  updateSocials: (enabled: boolean) => void
  updateEnableWallets: (enabled: boolean) => void
  updateUrls: (urls: { termsConditions?: string; privacyPolicy?: string }) => void
  setEnableWallets: (enabled: boolean) => void
  setSocialsOrder: ((order: SocialProvider[]) => void) | undefined
  updateDraggingState: (key: UniqueIdentifier, dragging: boolean) => void
  resetConfigs: () => void
}

export const AppKitContext = createContext<AppKitContextType | undefined>(undefined)
