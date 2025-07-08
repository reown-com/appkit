'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface ProjectIdContextType {
  projectId: string | undefined
  setProjectId: (id: string | undefined) => void
  isProjectIdLoading: boolean
}

const ProjectIdContext = createContext<ProjectIdContextType | undefined>(undefined)

interface ProjectIdProviderProps {
  children: ReactNode
}

export function ProjectIdProvider({ children }: ProjectIdProviderProps) {
  const [projectId, setProjectIdState] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('customProjectId') || undefined
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to read projectId from localStorage during init:', error)

        return undefined
      }
    }

    return undefined
  })
  const [isProjectIdLoading, setIsProjectIdLoading] = useState(true)

  const setProjectId = useCallback((id: string | undefined) => {
    setProjectIdState(id)
    if (typeof window !== 'undefined') {
      try {
        if (id) {
          localStorage.setItem('customProjectId', id)
        } else {
          localStorage.removeItem('customProjectId')
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to update projectId in localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    /*
     * ProjectId state is already initialized from localStorage by the useState initializer.
     * This effect runs once after the component mounts on the client.
     * Its primary purpose here is to set isProjectIdLoading to false.
     * Empty dependency array ensures it runs only once on mount.
     */
    setIsProjectIdLoading(false)
  }, [])

  const contextValue = useMemo(
    () => ({ projectId, setProjectId, isProjectIdLoading }),
    [projectId, setProjectId, isProjectIdLoading]
  )

  return <ProjectIdContext.Provider value={contextValue}>{children}</ProjectIdContext.Provider>
}

export function useProjectIdContext(): ProjectIdContextType {
  const context = useContext(ProjectIdContext)
  if (!context) {
    throw new Error('useProjectIdContext must be used within a ProjectIdProvider')
  }

  return context
}
