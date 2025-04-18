import { createContext, useEffect } from 'react'

import { useSnapshot } from 'valtio/react'

import type { AppKit, CreateAppKit } from '@reown/appkit'
import { createAppKit } from '@reown/appkit/react'

import InitializeBoundary from '../components/InitializeBoundary'
import { AppKitStore, setAppKit } from '../utils/AppKitStore'
import { ThemeStore } from '../utils/StoreUtil'

type AppKitContextType = {
  projectId: string
  appKit: AppKit | undefined
}

export const AppKitContext = createContext<AppKitContextType>({
  projectId: '',
  appKit: undefined
})

export function AppKitProvider({
  children,
  config
}: {
  children: React.ReactNode
  config: Omit<CreateAppKit, 'projectId'> & { projectId?: string }
}) {
  const { appKit } = useSnapshot(AppKitStore)
  const projectId = config.projectId || process.env['NEXT_PUBLIC_PROJECT_ID']
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }

  useEffect(() => {
    if (config) {
      const modal = createAppKit({
        ...config,
        projectId
      })
      setAppKit(modal)
      ThemeStore.setModal(modal)
    }
  }, [])

  return (
    <AppKitContext.Provider value={{ projectId, appKit: appKit as AppKit | undefined }}>
      {appKit && <InitializeBoundary>{children}</InitializeBoundary>}
    </AppKitContext.Provider>
  )
}
