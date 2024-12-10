'use client'

import { createContext } from 'react'
import type { Features, ThemeMode, SocialProvider } from '@reown/appkit-core'
import { URLState } from '@/lib/url-state'
import { UniqueIdentifier } from '@dnd-kit/core'

interface AppKitContextType {
  config: URLState
  enableWallets: boolean
  socialsEnabled: boolean
  isDraggingByKey: Record<string, boolean>
  isInitialized: boolean
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
