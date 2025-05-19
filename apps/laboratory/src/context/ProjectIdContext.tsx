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
  const [projectId, setProjectIdState] = useState<string | undefined>(undefined)
  const [isProjectIdLoading, setIsProjectIdLoading] = useState(true)

  const setProjectId = useCallback((id: string | undefined) => {
    setProjectIdState(id)
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('customProjectId', id)
      } else {
        localStorage.removeItem('customProjectId')
      }
    }
  }, [])

  useEffect(() => {
    try {
      const storedProjectId = localStorage.getItem('customProjectId')
      if (storedProjectId) {
        setProjectIdState(storedProjectId)
      }
    } catch (error) {
      console.error('Failed to load projectId from localStorage:', error)
    } finally {
      setIsProjectIdLoading(false)
    }
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
