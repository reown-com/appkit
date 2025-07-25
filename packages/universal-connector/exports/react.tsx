import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

import {
  UniversalConnector,
  type Config as UniversalConnectorConfig
} from '../src/UniversalConnector.js'

// -- Types --------------------------------------------------------------------------------
export type UniversalConnectorProviderProps = UniversalConnectorConfig & {
  children: ReactNode
}

// -- Context ------------------------------------------------------------------------------
export const UniversalConnectorContext = createContext<{
  connector: Awaited<ReturnType<typeof UniversalConnector.init>> | null
  ready: boolean
} | null>(null)

export function useUniversalConnector() {
  const context = useContext(UniversalConnectorContext)
  if (!context) {
    throw new Error('useUniversalConnector must be used within UniversalConnectorProvider')
  }

  return context
}

// -- Providers ----------------------------------------------------------------------------
export function UniversalConnectorProvider({
  children,
  ...props
}: UniversalConnectorProviderProps) {
  const [connector, setConnector] = useState<Awaited<
    ReturnType<typeof UniversalConnector.init>
  > | null>(null)

  const [isReady, setIsReady] = useState(false)

  async function initConnector(config: UniversalConnectorConfig) {
    try {
      if (!connector) {
        const universalConnector = await UniversalConnector.init(config)
        setConnector(universalConnector)
        setIsReady(true)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Failed to initialize UniversalConnector', error)
      setIsReady(true)
    }
  }

  useEffect(() => {
    initConnector(props)
  }, [props])

  return (
    <UniversalConnectorContext.Provider value={{ connector, ready: isReady }}>
      {children}
    </UniversalConnectorContext.Provider>
  )
}
