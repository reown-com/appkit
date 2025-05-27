'use client'

import { createContext, useEffect, useMemo } from 'react'

import { useColorMode } from '@chakra-ui/react'
import { useSnapshot } from 'valtio/react'

import type { AppKit, CreateAppKit } from '@reown/appkit'
import { createAppKit } from '@reown/appkit/react'

import InitializeBoundary from '../components/InitializeBoundary'
import { useProjectId } from '../hooks/useProjectId'
import { AppKitStore, setAppKit } from '../utils/AppKitStore'
import { ThemeStore } from '../utils/StoreUtil'

interface AppKitContextType {
  projectId: string | undefined
  appKit: AppKit | undefined
}

export const AppKitContext = createContext<AppKitContextType>({
  projectId: undefined,
  appKit: undefined
})

export function AppKitProvider({
  children,
  config
}: {
  children: React.ReactNode
  config: Omit<CreateAppKit, 'projectId'> & { projectId?: string }
}) {
  const { appKit: currentAppKitSnapshot } = useSnapshot(AppKitStore)
  const { colorMode } = useColorMode()
  const { projectId: injectedProjectId, isProjectIdLoading } = useProjectId()

  const resolvedProjectId = useMemo(() => {
    if (injectedProjectId) {
      return injectedProjectId
    }
    if (config.projectId) {
      return config.projectId
    }

    return process.env['NEXT_PUBLIC_PROJECT_ID']
  }, [injectedProjectId, config.projectId])

  useEffect(() => {
    if (!isProjectIdLoading && resolvedProjectId && config) {
      const newAppKitInstance = createAppKit({
        ...config,
        projectId: resolvedProjectId
      })
      setAppKit(newAppKitInstance)
      ThemeStore.setModal(newAppKitInstance)
      newAppKitInstance.setThemeMode(colorMode)
    }
  }, [config, resolvedProjectId, isProjectIdLoading, colorMode])

  return (
    <AppKitContext.Provider
      value={{
        projectId: resolvedProjectId,
        appKit: currentAppKitSnapshot as AppKit | undefined
      }}
    >
      {(() => {
        if (isProjectIdLoading && !resolvedProjectId) {
          return null
        }

        if (currentAppKitSnapshot && resolvedProjectId) {
          return (
            <>
              <InitializeBoundary>{children}</InitializeBoundary>
            </>
          )
        }

        return null
      })()}
    </AppKitContext.Provider>
  )
}
